const employeeService = require('../services/employee.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await employeeService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getById(req.params.id);
    res.json({ success: true, data: { employee } });
  } catch (error) { next(error); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const employee = await employeeService.getByUserId(req.user._id);
    res.json({ success: true, data: { employee } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const employee = await employeeService.create(req.body);
    res.status(201).json({ success: true, data: { employee } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const employee = await employeeService.update(req.params.id, req.body);
    res.json({ success: true, data: { employee } });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await employeeService.delete(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};
