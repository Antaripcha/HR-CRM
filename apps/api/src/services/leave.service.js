const Leave = require('../models/Leave');

class LeaveService {
  async getAll(query = {}, userRole, userId) {
    const { page = 1, limit = 10, status, type } = query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (userRole === 'employee') filter.employee = userId;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate('employee', 'name email')
        .populate('reviewedBy', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Leave.countDocuments(filter),
    ]);

    return { leaves, total, page: Number(page), pages: Math.ceil(total / limit) };
  }

  async getById(id) {
    const leave = await Leave.findById(id)
      .populate('employee', 'name email')
      .populate('reviewedBy', 'name email');
    if (!leave) throw Object.assign(new Error('Leave not found'), { statusCode: 404 });
    return leave;
  }

  async apply(userId, data) {
    const { type, startDate, endDate, reason } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) throw Object.assign(new Error('End date must be after start date'), { statusCode: 400 });

    // Check for overlapping leaves
    const overlap = await Leave.findOne({
      employee: userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });
    if (overlap) throw Object.assign(new Error('You already have a leave in this date range'), { statusCode: 400 });

    const leave = await Leave.create({ employee: userId, type, startDate: start, endDate: end, reason });
    return leave.populate('employee', 'name email');
  }

  async review(id, reviewerId, action, note) {
    const leave = await Leave.findById(id);
    if (!leave) throw Object.assign(new Error('Leave not found'), { statusCode: 404 });
    if (leave.status !== 'pending') throw Object.assign(new Error('Leave already reviewed'), { statusCode: 400 });

    leave.status = action;
    leave.reviewedBy = reviewerId;
    leave.reviewedAt = new Date();
    if (note) leave.reviewNote = note;
    await leave.save();

    return leave.populate('employee', 'name email').populate('reviewedBy', 'name email');
  }

  async cancel(id, userId) {
    const leave = await Leave.findOne({ _id: id, employee: userId });
    if (!leave) throw Object.assign(new Error('Leave not found'), { statusCode: 404 });
    if (leave.status !== 'pending') throw Object.assign(new Error('Only pending leaves can be cancelled'), { statusCode: 400 });
    leave.status = 'cancelled';
    await leave.save();
    return leave;
  }

  async getStats(userId, role) {
    const filter = role === 'employee' ? { employee: userId } : {};
    const stats = await Leave.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  }
}

module.exports = new LeaveService();
