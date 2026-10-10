import { z } from 'zod';

export const createAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  admin_code: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
  profile_image: z.string().url().optional().nullable()
});

export const updateAdminSchema = createAdminSchema.partial();
