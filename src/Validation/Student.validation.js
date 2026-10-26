import { z } from 'zod';

export const conceptStruggleSchema = z.object({
  concept_id: z.string().min(1, 'Concept ID is required'),
  concept_label: z.string().min(1, 'Concept label is required'),
  times_tested: z.number().int().nonnegative().optional().default(0),
  times_wrong: z.number().int().nonnegative().optional().default(0),
  last_diagnosed_misconception: z.string().nullable().optional().default(null)
});

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
  achievement: z.string().optional().nullable(),
  current_streak: z.number().int().nonnegative().optional().default(0),
  longest_streak: z.number().int().nonnegative().optional().default(0),
  lessons_completed: z.number().int().nonnegative().optional().default(0),
  struggling_concepts: z.array(conceptStruggleSchema).optional().default([])
});

export const updateStudentSchema = createStudentSchema.partial();
