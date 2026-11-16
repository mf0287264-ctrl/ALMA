import { z } from 'zod';

export const createParentSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional().default('Parent'),
  last_name: z.string().optional().default('User'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  phone_number: z.string().optional().nullable(),
  national_id: z.string().optional().nullable(),
  profile_image: z.string().optional().nullable(),
  relation: z.enum(['father', 'mother', 'guardian']).optional().default('guardian'),
  child_email: z.string().email('Invalid child email').optional().nullable(),
  child_student_code: z.string().optional().nullable()
});

export const loginParentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateParentSchema = createParentSchema.partial();

export const linkChildSchema = z.object({
  child_email: z.string().email('Invalid child email').optional().nullable(),
  child_student_code: z.string().optional().nullable()
}).refine((data) => data.child_email || data.child_student_code, {
  message: 'Either child_email or child_student_code is required'
});

export const sendMessageSchema = z.object({
  teacher_id: z.string().min(1, 'Teacher ID is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000)
});
