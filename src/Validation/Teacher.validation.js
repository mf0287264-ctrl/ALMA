import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  first_name: z.string().trim().min(1).max(100).optional().default('Teacher'),
  last_name: z.string().trim().min(1).max(100).optional().default('User'),
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(12, 'Use a password with at least 12 characters.').max(128),
  teacher_code: z.string().max(500).optional(),
  specialization: z.string().max(500).optional().default('Computer Science'),
  school_name: z.string().trim().min(1).max(100).optional().nullable(),
  profile_image: z.string().max(500).optional().nullable(),
  phone_number: z.string().max(500).optional().nullable()
});

export const loginTeacherSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128)
});

export const updateTeacherSchema = createTeacherSchema.partial();

