import { BlogAdminCard } from '@/components/blog/blog-admin-card';
import { BlogListCard } from '@/components/blog/blog-list-card';
import { BlogPreviewModal } from '@/components/blog/blog-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc, type BlogPostListItem } from '@/lib/blog/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Row = BlogPostListItem;

const TAB_BAR_CLEARANCE = 56;

export default function BlogListScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewPost, setPreviewPost] = useState<Row | null>(null);

  useEffect(() => {
    setError('');
    const base = collection(db, BLOG_POSTS_COLLECTION);
    const q = isAdmin
      ? query(base, orderBy('updatedAt', 'desc'), limit(120))
      : query(
          base,
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
        console.error('[BlogList]', err);
        setError('No se pudieron cargar los artículos.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, [isAdmin]);

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      'Eliminar artículo',
      `¿Eliminar «${title}»?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, BLOG_POSTS_COLLECTION, id));
            } catch (e) {
              console.error('[BlogDelete]', e);
              Alert.alert('Error', 'No se pudo eliminar.');
            }
          },
        },
      ],
    );
  };

  const fabBottom = insets.bottom + TAB_BAR_CLEARANCE;
  const fabRight = Math.max(insets.right, 16);

  const goFormNew = () => {
    router.push('/(tabs)/more/blog/form');
  };

  const goFormEdit = (id: string) => {
    router.push({
      pathname: '/(tabs)/more/blog/form',
      params: { id },
    });
  };

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
        <Btn onPress={() => router.back()} style={styles.back}>
          <ThemedText type="link">← Volver</ThemedText>
        </Btn>
        <ThemedText type="title">Blog de salud</ThemedText>
        <ThemedText style={styles.hint}>
          {isAdmin
            ? 'Todos los artículos (publicados y borradores)'
            : 'Artículos publicados por el equipo'}
        </ThemedText>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={palette.brand.primary}
          />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : rows.length === 0 ? (
          <ThemedText style={styles.empty}>
            {isAdmin
              ? 'Aún no hay artículos. Pulsa + para crear.'
              : 'Aún no hay artículos publicados.'}
          </ThemedText>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              isAdmin && styles.scrollContentFab,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {rows.map((r) =>
              isAdmin ? (
                <BlogAdminCard
                  key={r.id}
                  post={r}
                  onOpenDetail={() => goToPostDetail(r.id)}
                  onOpenSummary={() => setPreviewPost(r)}
                  onEdit={() => goFormEdit(r.id)}
                  onDelete={() => confirmDelete(r.id, r.title)}
                />
              ) : (
                <BlogListCard
                  key={r.id}
                  post={r}
                  onOpenDetail={() => goToPostDetail(r.id)}
                  onOpenSummary={() => setPreviewPost(r)}
                />
              ),
            )}
          </ScrollView>
        )}

        <BlogPreviewModal
          visible={previewPost !== null}
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          showStatus={isAdmin}
        />

        {isAdmin ? (
          <Pressable
            accessibilityLabel="Nuevo artículo"
            onPress={goFormNew}
            style={({ pressed }) => [
              styles.fab,
              { bottom: fabBottom, right: fabRight },
              pressed && styles.fabPressed,
            ]}
          >
            <Ionicons name="add" size={32} color={palette.text.inverse} />
          </Pressable>
        ) : null}
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
  scrollContentFab: { paddingBottom: 100 },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
});
