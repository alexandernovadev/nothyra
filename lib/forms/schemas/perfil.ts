import { z } from 'zod';

/**
 * Esquema para formulario de perfil (editar usuario).
 */

export const perfilSchema = z.object({
  displayName: z.string(),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico no válido')
    .transform((v) => v.trim()),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
