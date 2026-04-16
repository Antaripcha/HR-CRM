const departmentService = require('../services/department.service');

exports.getAll = async (req, res, next) => {
  try {
    const departments = await departmentService.getAll();
    res.json({ success: true, data: { departments } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const department = await departmentService.getById(req.params.id);
    res.json({ success: true, data: { department } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const department = await departmentService.create(req.body);
    res.status(201).json({ success: true, data: { department } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const department = await departmentService.update(req.params.id, req.body);
    res.json({ success: true, data: { department } });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await departmentService.delete(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};
