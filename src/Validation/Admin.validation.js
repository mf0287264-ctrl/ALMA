import { z } from 'zod';

export const createAdminSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional().default('Admin'),
  last_name: z.string().optional().default('User'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  admin_code: z.string().optional().default(() => `ADM-${Math.floor(1000 + Math.random() * 9000)}`),
  permissions: z.array(z.string()).optional().default(['all']),
  profile_image: z.string().url().optional().nullable()
});

export const loginAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateAdminSchema = createAdminSchema.partial();

