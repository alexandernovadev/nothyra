/** Recipe taxonomy — English ids in Firestore, Spanish UI. */

export const RECIPE_CATEGORIES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert',
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const RECIPE_CATEGORY_LABELS_ES: Record<RecipeCategory, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  dessert: 'Postre',
};

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

export const RECIPE_DIFFICULTY_LABELS_ES: Record<RecipeDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

export const RECIPE_STATUSES = ['draft', 'published'] as const;
export type RecipeStatus = (typeof RECIPE_STATUSES)[number];

export const RECIPE_STATUS_LABELS_ES: Record<RecipeStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
};
