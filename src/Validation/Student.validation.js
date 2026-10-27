import { z } from 'zod';

export const conceptStruggleSchema = z.object({
  concept_id: z.string().min(1, 'Concept ID is required'),
  concept_label: z.string().min(1, 'Concept label is required'),
  times_tested: z.number().int().nonnegative().optional().default(0),
  times_wrong: z.number().int().nonnegative().optional().default(0),
  last_diagnosed_misconception: z.string().nullable().optional().default(null)
});

export const createStudentSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional().default('Student'),
  last_name: z.string().optional().default('User'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  student_code: z.string().optional().default(() => `STU-${Math.floor(1000 + Math.random() * 9000)}`),
  grade_level: z.string().optional().default('Grade 8'),
  school_name: z.string().optional().nullable(),
  profile_image: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  national_id: z.string().optional().nullable(),
  parent_phone: z.string().optional().nullable(),
  learning_for: z.string().optional().default('me'),
  age_group: z.string().optional().nullable(),
  coding_experience: z.string().optional().nullable(),
  learning_styles: z.array(z.string()).optional().default([]),
  gender: z.string().optional().nullable(),
  quiz_answers: z.array(z.any()).optional().default([]),
  current_streak: z.number().int().nonnegative().optional().default(0),
  longest_streak: z.number().int().nonnegative().optional().default(0),
  lessons_completed: z.number().int().nonnegative().optional().default(0),
  struggling_concepts: z.array(conceptStruggleSchema).optional().default([])
});

export const loginStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateStudentSchema = createStudentSchema.partial();
