const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

// Auth schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'hr', 'employee']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Employee schemas
const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  role: z.enum(['hr', 'employee']).optional(),
});

// Leave schemas
const leaveSchema = z.object({
  type: z.enum(['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// Department schemas
const departmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  head: z.string().optional(),
  budget: z.number().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  employeeSchema,
  leaveSchema,
  departmentSchema,
};
