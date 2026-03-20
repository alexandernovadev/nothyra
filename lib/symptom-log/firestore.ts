import type { EnergyLevel, MoodLevel, SymptomId } from '@/constants/symptom-log';
import type { Timestamp } from 'firebase/firestore';

export const SYMPTOM_LOGS_COLLECTION = 'symptomLogs';

/** @deprecated Legacy deterministic id; new logs use auto-generated Firestore document ids. */
export function symptomLogDocId(userId: string, dateKey: string): string {
  return `${userId}_${dateKey}`;
}

export type SymptomLogFirestoreDoc = {
  userId: string;
  dateKey: string;
  energyLevel: EnergyLevel;
  mood: MoodLevel;
  symptoms: SymptomId[];
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export function sortKeyFromLog(d: {
  createdAt?: Timestamp | null;
  dateKey?: string;
}): number {
  const ts = d.createdAt;
  if (ts && typeof ts.toMillis === 'function') {
    return ts.toMillis();
  }
  const parts = String(d.dateKey ?? '').split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  }
  return 0;
}
