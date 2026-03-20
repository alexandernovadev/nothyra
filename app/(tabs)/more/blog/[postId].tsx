import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { formatBlogPostDate } from '@/lib/blog/format-date';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc } from '@/lib/blog/firestore';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BlogPostDetailScreen() {
  const raw = useLocalSearchParams<{ postId?: string | string[] }>();
  const pid = raw.postId;
  const postId = Array.isArray(pid) ? pid[0] : pid;
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<(BlogPostDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!postId || typeof postId !== 'string' || postId.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const snap = await getDoc(doc(db, BLOG_POSTS_COLLECTION, postId));
      if (!snap.exists()) {
        setNotFound(true);
        setPost(null);
        return;
      }
      const d = snap.data() as BlogPostDoc;
      if (d.status !== 'published' && !isAdmin) {
        setNotFound(true);
        setPost(null);
        return;
      }
      setPost({ id: snap.id, ...d });
    } catch (e) {
      console.error('[BlogPostDetail]', e);
      setNotFound(true);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const dateLabel = post ? formatBlogPostDate(post.updatedAt) : '';
  const paragraphs = (post?.content ?? []).filter((p) => p.trim());

  return (
    <MainLayout>
      <View style={styles.root}>
        <Btn onPress={() => router.back()} style={styles.back}>
          <ThemedText type="link">← Volver</ThemedText>
        </Btn>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={palette.brand.primary}
          />
        ) : notFound || !post ? (
          <ThemedText style={styles.error}>
            Artículo no disponible o no publicado.
          </ThemedText>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {post.coverImageUrl ? (
              <Image
                source={{ uri: post.coverImageUrl }}
                style={styles.hero}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.hero, styles.heroPlaceholder]} />
            )}
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.meta}>
              {post.author}
              {dateLabel ? ` · ${dateLabel}` : ''}
            </Text>
            {post.excerpt ? <ThemedText style={styles.excerpt}>{post.excerpt}</ThemedText> : null}

            {paragraphs.map((para, i) => (
              <ThemedText key={i} style={styles.para}>
                {para}
              </ThemedText>
            ))}

            {(post.tags ?? []).length > 0 ? (
              <View style={styles.tags}>
                {(post.tags ?? []).map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {isAdmin ? (
              <Btn
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/more/blog/form',
                    params: { id: post.id },
                  })
                }
              >
                <ThemedText type="defaultSemiBold" style={styles.editBtnText}>
                  Editar
                </ThemedText>
              </Btn>
            ) : null}
          </ScrollView>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', alignSelf: 'stretch' },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  loader: { marginTop: 32 },
  error: { marginTop: 16, color: palette.semantic.error },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    backgroundColor: palette.surface.input,
    marginBottom: 12,
  },
  heroPlaceholder: {},
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text.primary,
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: palette.text.secondary,
  },
  excerpt: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.muted,
    fontStyle: 'italic',
  },
  para: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 26,
    color: palette.text.primary,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: palette.semantic.infoMuted,
  },
  tagText: { fontSize: 12, color: palette.semantic.info },
  editBtn: {
    marginTop: 24,
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 14,
  },
  editBtnText: { color: palette.text.inverse, textAlign: 'center' },
});
