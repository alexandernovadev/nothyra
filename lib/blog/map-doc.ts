import type { BlogPostFormData } from '@/lib/forms';
import type { BlogPostDoc } from './firestore';

export function blogPostDocToFormData(
  data: Omit<BlogPostDoc, 'createdAt' | 'updatedAt'>,
): BlogPostFormData {
  return {
    title: data.title,
    excerpt: data.excerpt,
    coverImageUrl: data.coverImageUrl,
    author: data.author,
    content: data.content?.length > 0 ? data.content : [''],
    tags: data.tags ?? [],
    status: data.status,
  };
}
