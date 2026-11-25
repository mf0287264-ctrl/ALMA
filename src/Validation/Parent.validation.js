import { z } from 'zod';

export const createParentSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  first_name: z.string().trim().min(1).max(100).optional().default('Parent'),
  last_name: z.string().trim().min(1).max(100).optional().default('User'),
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(12, 'Use a password with at least 12 characters.').max(128),
  phone_number: z.string().max(500).optional().nullable(),
  national_id: z.string().max(500).optional().nullable(),
  profile_image: z.string().max(500).optional().nullable(),
  relation: z.enum(['father', 'mother', 'guardian']).optional().default('guardian'),
  child_email: z.string().email('Invalid child email').optional().nullable(),
  child_student_code: z.string().max(500).optional().nullable(),
  privacy_settings: z.object({
    show_alma_questions: z.boolean().optional().default(false),
    show_session_times: z.boolean().optional().default(true),
    weekly_report_email: z.boolean().optional().default(true)
  }).optional(),
  alert_rules: z.object({
    streak_broken: z.boolean().optional().default(true),
    new_struggling_concept: z.boolean().optional().default(true),
    session_abandoned: z.boolean().optional().default(false),
    new_achievement: z.boolean().optional().default(true),
    delivery_channel: z.enum(['email', 'sms']).optional().default('email')
  }).optional()
});

export const loginParentSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128)
});

export const updateParentSchema = createParentSchema.partial();

export const linkChildSchema = z.object({
  child_email: z.string().email('Invalid child email').optional().nullable(),
  child_student_code: z.string().max(500).optional().nullable(),
  student_code: z.string().max(500).optional().nullable(),
  parent_phone: z.string().max(500).optional().nullable()
}).refine(
  (data) => data.child_email || data.child_student_code || data.student_code,
  {
    message: 'Student code or child email is required'
  }
);

export const unlinkChildSchema = z.object({
  child_id: z.string().min(1, 'Child ID is required')
});

export const sendMessageSchema = z.object({
  type: z.enum(['teacher', 'support']).optional().default('teacher'),
  teacher_id: z.string().max(500).optional().nullable(),
  inquiry_type: z.string().max(500).optional().default('General inquiry'),
  related_child_id: z.string().max(500).optional().nullable(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000)
});
