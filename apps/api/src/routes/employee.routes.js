const router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/me', employeeController.getMyProfile);
router.get('/', authorize('admin', 'hr'), employeeController.getAll);
router.get('/:id', authorize('admin', 'hr'), employeeController.getById);
router.post('/', authorize('admin', 'hr'), employeeController.create);
router.patch('/:id', authorize('admin', 'hr'), employeeController.update);
router.delete('/:id', authorize('admin'), employeeController.delete);

module.exports = router;
