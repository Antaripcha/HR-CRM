const User = require('../models/User');
const Employee = require('../models/Employee');

class EmployeeService {
  async getAll(query = {}) {
    const { page = 1, limit = 10, search, department, status } = query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    let employeeQuery = Employee.find(filter)
      .populate({
        path: 'user',
        select: 'name email role isActive',
        match: search ? { name: { $regex: search, $options: 'i' } } : {},
      })
      .populate('department', 'name code')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const [employees, total] = await Promise.all([
      employeeQuery,
      Employee.countDocuments(filter),
    ]);

    const filtered = employees.filter(e => e.user !== null);

    return { employees: filtered, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  }

  async getById(id) {
    const employee = await Employee.findById(id)
      .populate('user', 'name email role isActive lastLogin')
      .populate('department', 'name code head');
    if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
    return employee;
  }

  async getByUserId(userId) {
    const employee = await Employee.findOne({ user: userId })
      .populate('user', 'name email role isActive')
      .populate('department', 'name code head');
    if (!employee) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return employee;
  }

  async create(data) {
    const { name, email, password = 'Welcome@123', role = 'employee', phone, department, designation, joiningDate } = data;

    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 400 });

    const user = await User.create({ name, email, password, role });
    const employee = await Employee.create({ user: user._id, phone, department, designation, joiningDate });

    return Employee.findById(employee._id).populate('user', 'name email role').populate('department', 'name code');
  }

  async update(id, data) {
    const employee = await Employee.findById(id).populate('user');
    if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });

    const { name, email, role, phone, department, designation, joiningDate, status, salary, address, emergencyContact } = data;

    if (name || email || role) {
      await User.findByIdAndUpdate(employee.user._id, {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      });
    }

    Object.assign(employee, {
      ...(phone !== undefined && { phone }),
      ...(department !== undefined && { department }),
      ...(designation !== undefined && { designation }),
      ...(joiningDate !== undefined && { joiningDate }),
      ...(status !== undefined && { status }),
      ...(salary !== undefined && { salary }),
      ...(address !== undefined && { address }),
      ...(emergencyContact !== undefined && { emergencyContact }),
    });

    await employee.save();
    return Employee.findById(id).populate('user', 'name email role').populate('department', 'name code');
  }

  async delete(id) {
    const employee = await Employee.findById(id);
    if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    employee.status = 'terminated';
    await employee.save();
    return { message: 'Employee deactivated successfully' };
  }
}

module.exports = new EmployeeService();
