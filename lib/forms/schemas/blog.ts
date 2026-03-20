import { RECIPE_STATUSES } from '@/constants/recipes';
import { z } from 'zod';

const statusEnum = z.enum(RECIPE_STATUSES);

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  excerpt: z.string().min(1, 'Resumen requerido').max(600),
  coverImageUrl: z.string().max(2000),
  author: z.string().min(1, 'Autor requerido').max(120),
  content: z
    .array(z.string().trim().min(1, 'Párrafo vacío'))
    .min(1, 'Añade al menos un párrafo'),
  tags: z.array(z.string().min(1).max(40)).max(20),
  status: statusEnum,
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
