import { z } from 'zod';

export const createModuleSchema = z.object({
  course_id: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().int().min(1).default(1),
  learning_objectives: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

export const updateModuleSchema = createModuleSchema.partial();
