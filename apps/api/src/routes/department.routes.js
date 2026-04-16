const router = require('express').Router();
const departmentController = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', authorize('admin'), departmentController.create);
router.patch('/:id', authorize('admin'), departmentController.update);
router.delete('/:id', authorize('admin'), departmentController.delete);

module.exports = router;
