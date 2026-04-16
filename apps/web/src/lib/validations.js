import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'hr', 'employee']).optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  role: z.enum(['hr', 'employee']).default('employee'),
});

export const leaveSchema = z.object({
  type: z.enum(['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a reason (min 10 chars)'),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  head: z.string().optional(),
  budget: z.coerce.number().optional(),
});

// Helper to use with forms
export const zodResolver = (schema) => async (values) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors = {};
  result.error.errors.forEach(e => {
    const key = e.path.join('.');
    if (!errors[key]) errors[key] = { message: e.message };
  });
  return { values: {}, errors };
};
