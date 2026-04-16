const Department = require('../models/Department');
const Employee = require('../models/Employee');

class DepartmentService {
  async getAll() {
    const departments = await Department.find()
      .populate('head', 'name email')
      .sort({ name: 1 });

    const withCounts = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id, status: 'active' });
      return { ...dept.toJSON(), employeeCount: count };
    }));

    return withCounts;
  }

  async getById(id) {
    const dept = await Department.findById(id).populate('head', 'name email');
    if (!dept) throw Object.assign(new Error('Department not found'), { statusCode: 404 });
    return dept;
  }

  async create(data) {
    const dept = await Department.create(data);
    return dept.populate('head', 'name email');
  }

  async update(id, data) {
    const dept = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('head', 'name email');
    if (!dept) throw Object.assign(new Error('Department not found'), { statusCode: 404 });
    return dept;
  }

  async delete(id) {
    const dept = await Department.findById(id);
    if (!dept) throw Object.assign(new Error('Department not found'), { statusCode: 404 });
    const count = await Employee.countDocuments({ department: id, status: 'active' });
    if (count > 0) throw Object.assign(new Error('Cannot delete department with active employees'), { statusCode: 400 });
    await dept.deleteOne();
    return { message: 'Department deleted successfully' };
  }
}

module.exports = new DepartmentService();
