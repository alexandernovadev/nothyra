import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

/**
 * Upload a local image URI (e.g. from expo-image-picker) to Storage.
 * Path: recipes/{recipeId}/cover_{timestamp}.jpg
 */
export async function uploadRecipeCoverFromUri(
  recipeId: string,
  localUri: string,
): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase();
  const safeExt = ext === 'png' || ext === 'webp' ? ext : 'jpg';
  const path = `recipes/${recipeId}/cover_${Date.now()}.${safeExt}`;
  const storageRef = ref(storage, path);

  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });
  return getDownloadURL(storageRef);
}
