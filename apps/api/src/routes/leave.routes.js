const router = require('express').Router();
const leaveController = require('../controllers/leave.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/stats', leaveController.getStats);
router.get('/', leaveController.getAll);
router.get('/:id', leaveController.getById);
router.post('/apply', leaveController.apply);
router.patch('/:id/review', authorize('admin', 'hr'), leaveController.review);
router.patch('/:id/cancel', leaveController.cancel);

module.exports = router;
