import { z } from 'zod';

export const reminderSchema = z.object({
  label: z.string().trim().min(1, 'Etiqueta requerida').max(120),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  enabled: z.boolean(),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
