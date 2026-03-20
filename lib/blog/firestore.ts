import type { RecipeStatus } from '@/constants/recipes';
import type { BlogPostFormData } from '@/lib/forms';
import type { Timestamp } from 'firebase/firestore';

export const BLOG_POSTS_COLLECTION = 'blogPosts';

export type BlogPostDoc = {
  title: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  content: string[];
  tags: string[];
  status: RecipeStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type BlogPostListItem = {
  id: string;
} & Omit<BlogPostDoc, 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export function blogPostToFirestorePayload(
  data: BlogPostFormData,
  uid: string,
): Omit<BlogPostDoc, 'createdAt' | 'updatedAt'> {
  return {
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    coverImageUrl: data.coverImageUrl.trim(),
    author: data.author.trim(),
    content: data.content.map((p) => p.trim()).filter(Boolean),
    tags: data.tags.map((t) => t.trim().toLowerCase()),
    status: data.status,
    createdBy: uid,
  };
}

export function blogPostToFirestoreUpdatePayload(
  data: BlogPostFormData,
): Omit<BlogPostDoc, 'createdAt' | 'updatedAt' | 'createdBy'> & {
  coverImageUrl: string;
} {
  const base = blogPostToFirestorePayload(data, '');
  const { createdBy: _, ...rest } = base;
  return rest;
}
