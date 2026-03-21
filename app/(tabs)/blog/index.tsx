import { BlogListCard } from '@/components/blog/blog-list-card';
import { BlogPreviewModal } from '@/components/blog/blog-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { db } from '@/lib/firebase';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc, type BlogPostListItem } from '@/lib/blog/firestore';
import { useRouter } from 'expo-router';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type Row = BlogPostListItem;

export default function BlogPublicListScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewPost, setPreviewPost] = useState<Row | null>(null);

  useEffect(() => {
    setError('');
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(80),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Row[] = snap.docs.map((d) => {
          const x = d.data() as Omit<BlogPostDoc, 'createdAt' | 'updatedAt'>;
          return { id: d.id, ...x };
        });
        setRows(next);
        setLoading(false);
      },
      (err) => {
        console.error('[BlogPublicList]', err);
        setError('No se pudieron cargar los artículos.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const goToPostDetail = useCallback(
    (id: string) => {
      setPreviewPost(null);
      queueMicrotask(() => {
        router.push({
          pathname: './[postId]',
          params: { postId: id },
        });
      });
    },
    [router],
  );

  return (
    <MainLayout>
      <View style={styles.root}>
        <Btn onPress={() => router.replace('/(tabs)')} style={styles.back}>
          <ThemedText type="link">← Volver</ThemedText>
        </Btn>
        <ThemedText type="title">Blog de salud</ThemedText>
        <ThemedText style={styles.hint}>Artículos publicados por el equipo</ThemedText>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={palette.brand.primary}
          />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : rows.length === 0 ? (
          <ThemedText style={styles.empty}>Aún no hay artículos publicados.</ThemedText>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {rows.map((r) => (
              <BlogListCard
                key={r.id}
                post={r}
                onOpenDetail={() => goToPostDetail(r.id)}
                onOpenSummary={() => setPreviewPost(r)}
              />
            ))}
          </ScrollView>
        )}

        <BlogPreviewModal
          visible={previewPost !== null}
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          showStatus={false}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', alignSelf: 'stretch' },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  hint: { marginTop: 6, fontSize: 14, color: palette.text.secondary },
  loader: { marginTop: 32 },
  error: { marginTop: 16, color: palette.semantic.error },
  empty: { marginTop: 24, color: palette.text.muted },
  scroll: { flex: 1, marginTop: 16 },
  scrollContent: { paddingBottom: 24 },
});
