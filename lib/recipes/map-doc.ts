import type { RecipeFormData } from '@/lib/forms';
import type { RecipeDoc } from '@/lib/recipes/firestore';

/** Convierte documento Firestore a valores del formulario (sin timestamps). */
export function recipeDocToFormData(
  data: Omit<RecipeDoc, 'createdAt' | 'updatedAt'>,
): RecipeFormData {
  return {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    category: data.category,
    prepTime: data.prepTime,
    servings: data.servings,
    difficulty: data.difficulty,
    ingredients:
      data.ingredients?.length > 0 ? data.ingredients : [{ name: '', quantity: '' }],
    steps: data.steps?.length > 0 ? data.steps : [''],
    tags: data.tags ?? [],
    status: data.status,
  };
}
