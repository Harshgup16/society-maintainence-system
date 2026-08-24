import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  apartment_no: z.string().min(1, 'Apartment number is required').max(20),
  phone: z.string().min(1, 'Phone number is required').max(20),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Complaint schemas
export const createComplaintSchema = z.object({
  category: z.enum([
    'plumbing', 'electrical', 'structural', 'pest_control',
    'elevator', 'parking', 'security', 'cleaning', 'other',
  ], { errorMap: () => ({ message: 'Please select a category' }) }),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be under 2000 characters'),
});

// Status update schema
export const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
  note: z.string().max(500).optional(),
});

// Priority update schema
export const updatePrioritySchema = z.object({
  priority: z.enum(['low', 'medium', 'high']),
  note: z.string().max(500).optional(),
});

// Notice schemas
export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(5000),
  is_important: z.boolean().default(false),
});

export const updateNoticeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  is_important: z.boolean().optional(),
});

// Settings schema
export const updateSettingsSchema = z.object({
  overdue_threshold_days: z.number().int().min(1).max(90),
});
