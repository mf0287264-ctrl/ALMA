import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').trim(),
  title: z.string().trim().nullable().optional(),
  media: z.array(z.string().url('Invalid media URL').or(z.string())).optional().default([]),
  tags: z.array(z.string().trim()).optional().default([]),
  visibility: z.enum(['public', 'followers', 'friends']).optional().default('public')
});

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').trim().optional(),
  title: z.string().trim().nullable().optional(),
  media: z.array(z.string().url('Invalid media URL').or(z.string())).optional(),
  tags: z.array(z.string().trim()).optional(),
  visibility: z.enum(['public', 'followers', 'friends']).optional()
});

export const sharePostSchema = z.object({
  content: z.string().trim().optional(),
  title: z.string().trim().nullable().optional(),
  visibility: z.enum(['public', 'followers', 'friends']).optional().default('public')
});
