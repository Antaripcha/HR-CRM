const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/admin', authorize('admin', 'hr'), dashboardController.getAdminStats);
router.get('/employee', dashboardController.getEmployeeStats);

module.exports = router;
