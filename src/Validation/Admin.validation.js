import { z } from 'zod';

export const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  first_name: z.string().trim().min(1).max(100).optional().default('Admin'),
  last_name: z.string().trim().min(1).max(100).optional().default('User'),
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(12, 'Use a password with at least 12 characters.').max(128),
  admin_code: z.string().max(500).optional().default(() => `ADM-${Math.floor(1000 + Math.random() * 9000)}`),
  permissions: z.array(z.string()).optional().default(['all']),
  profile_image: z.string().url().optional().nullable()
});

export const loginAdminSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128)
});

export const updateAdminSchema = createAdminSchema.partial();

