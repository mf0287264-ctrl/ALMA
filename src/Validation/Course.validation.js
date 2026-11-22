import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  curriculum: z.string().optional().default('General'),
  language: z.string().default('en'),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  created_by: z.string().optional().nullable().default(null),
  course_image: z.string().optional().nullable()
});

export const updateCourseSchema = createCourseSchema.partial();
