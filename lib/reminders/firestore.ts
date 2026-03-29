import type { Timestamp } from 'firebase/firestore';

export const REMINDERS_COLLECTION = 'reminders';

export type ReminderDoc = {
  userId: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  notificationId?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ReminderListItem = {
  id: string;
} & ReminderDoc;

export function formatReminderTime(hour: number, minute: number): string {
  const safeHour = Math.max(0, Math.min(23, Math.trunc(hour)));
  const safeMinute = Math.max(0, Math.min(59, Math.trunc(minute)));
  return `${String(safeHour).padStart(2, '0')}:${String(safeMinute).padStart(2, '0')}`;
}
