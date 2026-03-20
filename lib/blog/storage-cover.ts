import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

/**
 * Sube la portada del artículo. Path: blog/{postId}/cover_{timestamp}.ext
 */
export async function uploadBlogCoverFromUri(
  postId: string,
  localUri: string,
): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase();
  const safeExt = ext === 'png' || ext === 'webp' ? ext : 'jpg';
  const path = `blog/${postId}/cover_${Date.now()}.${safeExt}`;
  const storageRef = ref(storage, path);

  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });
  return getDownloadURL(storageRef);
}
