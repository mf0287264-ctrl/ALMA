import { z } from 'zod';

export const conceptStruggleSchema = z.object({
  concept_id: z.string().min(1, 'Concept ID is required'),
  concept_label: z.string().min(1, 'Concept label is required'),
  times_tested: z.number().int().nonnegative().optional().default(0),
  times_wrong: z.number().int().nonnegative().optional().default(0),
  last_diagnosed_misconception: z.string().nullable().optional().default(null)
});

export const createStudentSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  first_name: z.string().trim().min(1).max(100).optional().default('Student'),
  last_name: z.string().trim().min(1).max(100).optional().default('User'),
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(12, 'Use a password with at least 12 characters.').max(128),
  student_code: z.string().max(500).optional(),
  grade_level: z.string().max(500).optional().default('Grade 8'),
  school_name: z.string().trim().min(1).max(100).optional().nullable(),
  profile_image: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional().default(true),
  national_id: z.string().max(500).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  parent_phone: z.string().max(500).optional().nullable(),
  learning_for: z.string().max(500).optional().default('me'),
  age_group: z.string().max(500).optional().nullable(),
  coding_experience: z.string().max(500).optional().nullable(),
  learning_styles: z.array(z.string()).optional().default([]),
  gender: z.string().max(500).optional().nullable(),
  quiz_answers: z.array(z.any()).optional().default([]),
  current_streak: z.number().int().nonnegative().optional().default(0),
  longest_streak: z.number().int().nonnegative().optional().default(0),
  lessons_completed: z.number().int().nonnegative().optional().default(0),
  struggling_concepts: z.array(conceptStruggleSchema).optional().default([]),
  following: z.array(z.string()).optional().default([]),
  followers: z.array(z.string()).optional().default([]),
  friends: z.array(z.string()).optional().default([]),
  friend_requests_sent: z.array(z.string()).optional().default([]),
  friend_requests_received: z.array(z.string()).optional().default([]),
  bookmarks: z.array(z.string()).optional().default([])
});

export const loginStudentSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128)
});

export const updateStudentSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address').optional(),
  password: z.string().min(12, 'Use a password with at least 12 characters.').max(128).optional(),
  grade_level: z.string().max(500).optional(),
  school_name: z.string().trim().min(1).max(100).optional().nullable(),
  profile_image: z.string().max(500).optional().nullable(),
  profileImage: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
  national_id: z.string().max(500).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  parent_phone: z.string().max(500).optional().nullable(),
  learning_for: z.string().max(500).optional(),
  age_group: z.string().max(500).optional().nullable(),
  coding_experience: z.string().max(500).optional().nullable(),
  learning_styles: z.array(z.string()).optional(),
  gender: z.string().max(500).optional().nullable(),
  quiz_answers: z.array(z.any()).optional(),
  current_streak: z.number().int().nonnegative().optional(),
  longest_streak: z.number().int().nonnegative().optional(),
  lessons_completed: z.number().int().nonnegative().optional(),
  struggling_concepts: z.array(conceptStruggleSchema).optional(),
  following: z.array(z.string()).optional(),
  followers: z.array(z.string()).optional(),
  friends: z.array(z.string()).optional(),
  friend_requests_sent: z.array(z.string()).optional(),
  friend_requests_received: z.array(z.string()).optional(),
  bookmarks: z.array(z.string()).optional()
}).partial();
