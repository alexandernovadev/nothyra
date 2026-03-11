import { z } from 'zod';

/**
 * Esquemas de validación para formularios de autenticación.
 * Orden: auth -> login, registro, etc.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico')
    .email('Correo electrónico no válido')
    .transform((v) => v.trim()),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico')
    .email('Correo electrónico no válido')
    .transform((v) => v.trim()),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegistroFormData = z.infer<typeof registroSchema>;
