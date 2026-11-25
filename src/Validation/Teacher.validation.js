import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional().default('Teacher'),
  last_name: z.string().optional().default('User'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  teacher_code: z.string().optional(),
  specialization: z.string().optional().default('Computer Science'),
  school_name: z.string().optional().nullable(),
  profile_image: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable()
});

export const loginTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateTeacherSchema = createTeacherSchema.partial();

