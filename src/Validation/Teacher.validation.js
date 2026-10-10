import { z } from 'zod';

export const createTeacherSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  teacher_code: z.string().min(1, 'Teacher code is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  school_name: z.string().optional().nullable(),
  profile_image: z.string().url().optional().nullable(),
  phone_number: z.string().optional().nullable()
});

export const updateTeacherSchema = createTeacherSchema.partial();
