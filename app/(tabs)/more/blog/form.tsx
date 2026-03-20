import { BlogPostForm } from '@/components/blog/blog-post-form';
import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { blogPostDocToFormData } from '@/lib/blog/map-doc';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc } from '@/lib/blog/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function BlogFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const postId = typeof id === 'string' && id.length > 0 ? id : undefined;

  const [ready, setReady] = useState(!postId);
  const [notFound, setNotFound] = useState(false);
  const [initial, setInitial] = useState<ReturnType<typeof blogPostDocToFormData> | null>(
    null,
  );

  const load = useCallback(async () => {
    if (!postId) {
      setReady(true);
      return;
    }
    try {
      const snap = await getDoc(doc(db, BLOG_POSTS_COLLECTION, postId));
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      const d = snap.data() as Omit<BlogPostDoc, 'createdAt' | 'updatedAt'>;
      setInitial(blogPostDocToFormData(d));
      setNotFound(false);
    } catch (e) {
      console.error('[BlogFormScreen]', e);
      setNotFound(true);
    } finally {
      setReady(true);
    }
  }, [postId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace('/(tabs)/more/blog');
      return;
    }
    load();
  }, [authLoading, isAdmin, load, router]);

  if (authLoading) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.brand.primary} />
        </View>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (postId && !ready) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.brand.primary} />
        </View>
      </MainLayout>
    );
  }

  if (postId && (notFound || !initial)) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ThemedText style={styles.err}>Artículo no encontrado.</ThemedText>
        </View>
      </MainLayout>
    );
  }

  if (postId && initial) {
    return <BlogPostForm mode="edit" postId={postId} initialValues={initial} />;
  }

  return <BlogPostForm mode="create" />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: palette.semantic.error, textAlign: 'center' },
});
