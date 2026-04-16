const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Leave = require('../models/Leave');

exports.getAdminStats = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      activeLeaves,
      recentEmployees,
      leavesByType,
      employeesByDept,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['employee', 'hr'] }, isActive: true }),
      Employee.countDocuments({ status: 'active' }),
      Department.countDocuments({ isActive: true }),
      Leave.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'approved', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }),
      Employee.find({ status: 'active' })
        .populate('user', 'name email')
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Leave.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Employee.aggregate([
        { $match: { status: 'active', department: { $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        { $project: { name: '$dept.name', count: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalEmployees, activeEmployees, totalDepartments, pendingLeaves, activeLeaves },
        recentEmployees,
        leavesByType,
        employeesByDept,
      },
    });
  } catch (error) { next(error); }
};

exports.getEmployeeStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [employee, leaveStats, recentLeaves] = await Promise.all([
      Employee.findOne({ user: userId }).populate('department', 'name'),
      Leave.aggregate([
        { $match: { employee: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Leave.find({ employee: userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const stats = leaveStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

    res.json({
      success: true,
      data: { employee, leaveStats: stats, recentLeaves },
    });
  } catch (error) { next(error); }
};
