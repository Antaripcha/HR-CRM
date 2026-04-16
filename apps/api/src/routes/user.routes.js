const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize('admin', 'hr'), userController.getAll);
router.get('/:id', authorize('admin', 'hr'), userController.getById);
router.patch('/profile', userController.updateProfile);
router.patch('/change-password', userController.changePassword);
router.patch('/:id/toggle-active', authorize('admin'), userController.toggleActive);

module.exports = router;
