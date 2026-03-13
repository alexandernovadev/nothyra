import { z } from 'zod';

/**
 * Esquema para formulario de perfil (solo nombre editable).
 * El correo nunca se puede cambiar.
 */

export const perfilSchema = z.object({
  displayName: z.string(),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
