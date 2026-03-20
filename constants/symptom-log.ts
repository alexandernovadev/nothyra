export const ENERGY_LEVELS = ['very_low', 'low', 'normal', 'high'] as const;
export type EnergyLevel = (typeof ENERGY_LEVELS)[number];

export const MOOD_LEVELS = ['depressed', 'normal', 'cheerful'] as const;
export type MoodLevel = (typeof MOOD_LEVELS)[number];

export const SYMPTOM_IDS = [
  'extreme_fatigue',
  'cold_sensitivity',
  'heat_sensitivity',
  'dry_skin',
  'anxiety',
  'depression',
  'difficulty_concentrating',
  'sleep_problems',
] as const;
export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const ENERGY_LABELS_ES: Record<EnergyLevel, string> = {
  very_low: 'Muy baja',
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
};

/** Ionicons names for each energy level (chips, list cards). */
export const ENERGY_LEVEL_ICONS: Record<EnergyLevel, string> = {
  very_low: 'battery-dead-outline',
  low: 'battery-half-outline',
  normal: 'remove-outline',
  high: 'flash-outline',
};

export const MOOD_LABELS_ES: Record<MoodLevel, string> = {
  depressed: 'Deprimido',
  normal: 'Normal',
  cheerful: 'Alegre',
};

/** Ionicons names for each mood (chips, list cards). */
export const MOOD_LEVEL_ICONS: Record<MoodLevel, string> = {
  depressed: 'sad-outline',
  normal: 'ellipse-outline',
  cheerful: 'happy-outline',
};

export const SYMPTOM_LABELS_ES: Record<SymptomId, string> = {
  extreme_fatigue: 'Cansancio extremo',
  cold_sensitivity: 'Sensibilidad al frío',
  heat_sensitivity: 'Sensibilidad al calor',
  dry_skin: 'Piel seca',
  anxiety: 'Ansiedad',
  depression: 'Sentimientos de depresión',
  difficulty_concentrating: 'Dificultad para concentrarse',
  sleep_problems: 'Problemas para dormir',
};

export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatLongDateSpanish(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateKey;
  const [y, mo, day] = parts;
  const date = new Date(y, mo - 1, day);
  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Short date for list cards (no weekday). */
export function formatCompactDateSpanish(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateKey;
  const [y, mo, day] = parts;
  const date = new Date(y, mo - 1, day);
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
