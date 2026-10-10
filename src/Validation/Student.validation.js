import { z } from 'zod';

export const createStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  student_code: z.string().min(1, 'Student code is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  school_name: z.string().optional().nullable(),
  profile_image: z.string().url().optional().nullable(),
  parent_phone: z.string().optional().nullable(),
  national_id: z.string().optional().nullable(),
  achievement: z.string().optional().nullable()
});

export const updateStudentSchema = createStudentSchema.partial();
