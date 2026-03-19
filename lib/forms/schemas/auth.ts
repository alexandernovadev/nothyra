import { z } from 'zod';

/**
 * Auth form validation schemas (login, sign-up, etc.).
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

export const signUpSchema = z.object({
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

export type SignUpFormData = z.infer<typeof signUpSchema>;
