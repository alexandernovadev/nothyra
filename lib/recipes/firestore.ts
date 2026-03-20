import type {
  RecipeCategory,
  RecipeDifficulty,
  RecipeStatus,
} from '@/constants/recipes';
import type { RecipeFormData } from '@/lib/forms';
import type { Timestamp } from 'firebase/firestore';

export const RECIPES_COLLECTION = 'recipes';

export type RecipeIngredient = { name: string; quantity: string };

export type RecipeDoc = {
  title: string;
  description: string;
  imageUrl: string;
  category: RecipeCategory;
  prepTime: number;
  servings: number;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  status: RecipeStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type RecipeListItem = {
  id: string;
} & Omit<RecipeDoc, 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export function recipeToFirestorePayload(
  data: RecipeFormData,
  uid: string,
): Omit<RecipeDoc, 'createdAt' | 'updatedAt'> {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    category: data.category,
    prepTime: data.prepTime,
    servings: data.servings,
    difficulty: data.difficulty,
    ingredients: data.ingredients.map((i) => ({
      name: i.name.trim(),
      quantity: i.quantity.trim(),
    })),
    steps: data.steps.map((s) => s.trim()),
    tags: data.tags.map((t) => t.trim().toLowerCase()),
    status: data.status,
    createdBy: uid,
  };
}

/** Actualización sin tocar `createdBy` ni `createdAt`. */
export function recipeToFirestoreUpdatePayload(
  data: RecipeFormData,
): Omit<
  RecipeDoc,
  'createdAt' | 'updatedAt' | 'createdBy'
> & { imageUrl: string } {
  const base = recipeToFirestorePayload(data, '');
  const { createdBy: _, ...rest } = base;
  return rest;
}
