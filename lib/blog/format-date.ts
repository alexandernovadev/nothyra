import type { Timestamp } from 'firebase/firestore';

export function formatBlogPostDate(ts: Timestamp | undefined): string {
  if (!ts || typeof ts.toDate !== 'function') {
    return '';
  }
  try {
    return ts.toDate().toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
