import { z } from 'zod';

const symptomIdEnum = z.enum([
  'extreme_fatigue',
  'cold_sensitivity',
  'heat_sensitivity',
  'dry_skin',
  'anxiety',
  'depression',
  'difficulty_concentrating',
  'sleep_problems',
]);

export const symptomLogSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  energyLevel: z.enum(['very_low', 'low', 'normal', 'high']),
  mood: z.enum(['depressed', 'normal', 'cheerful']),
  symptoms: z.array(symptomIdEnum),
  notes: z.string().max(2000),
});

export type SymptomLogFormData = z.infer<typeof symptomLogSchema>;
