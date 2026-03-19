import { z } from 'zod';

/**
 * Profile form: editable display name only. Email is read-only in the UI.
 */

export const profileSchema = z.object({
  displayName: z.string(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
