const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters')
});

const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters').optional(),
  content: z.string().optional()
});

const shareDocumentSchema = z.object({
  email: z.string().email('Invalid email format'),
  permission: z.enum(['view', 'edit'], {
    errorMap: () => ({ message: "Permission must be 'view' or 'edit'" })
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  createDocumentSchema,
  updateDocumentSchema,
  shareDocumentSchema
};
