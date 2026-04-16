const leaveService = require('../services/leave.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await leaveService.getAll(req.query, req.user.role, req.user._id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const leave = await leaveService.getById(req.params.id);
    res.json({ success: true, data: { leave } });
  } catch (error) { next(error); }
};

exports.apply = async (req, res, next) => {
  try {
    const leave = await leaveService.apply(req.user._id, req.body);
    res.status(201).json({ success: true, data: { leave } });
  } catch (error) { next(error); }
};

exports.review = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approved or rejected' });
    }
    const leave = await leaveService.review(req.params.id, req.user._id, action, note);
    res.json({ success: true, data: { leave } });
  } catch (error) { next(error); }
};

exports.cancel = async (req, res, next) => {
  try {
    const leave = await leaveService.cancel(req.params.id, req.user._id);
    res.json({ success: true, data: { leave } });
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await leaveService.getStats(req.user._id, req.user.role);
    res.json({ success: true, data: { stats } });
  } catch (error) { next(error); }
};
