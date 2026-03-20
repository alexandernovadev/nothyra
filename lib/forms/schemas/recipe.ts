import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  RECIPE_STATUSES,
} from '@/constants/recipes';
import { z } from 'zod';

const categoryEnum = z.enum(RECIPE_CATEGORIES);
const difficultyEnum = z.enum(RECIPE_DIFFICULTIES);
const statusEnum = z.enum(RECIPE_STATUSES);

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(120),
  quantity: z.string().min(1, 'Cantidad requerida').max(80),
});

export const recipeSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(120),
  description: z.string().max(2000),
  imageUrl: z.string().max(2000),
  category: categoryEnum,
  prepTime: z.number().int().min(1).max(9999),
  servings: z.number().int().min(1).max(99),
  difficulty: difficultyEnum,
  ingredients: z.array(ingredientSchema).min(1, 'Añade al menos un ingrediente'),
  steps: z
    .array(z.string().min(1, 'Paso vacío'))
    .min(1, 'Añade al menos un paso'),
  tags: z.array(z.string().min(1).max(40)).max(20),
  status: statusEnum,
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
