import z from 'zod';

export const toastItem = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['success', 'error', 'warning', 'info']),
  duration: z.number().optional(),
  message: z.string().optional(),
});
