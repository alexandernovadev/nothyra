import {
  HomeBlogPreviewCard,
  type HomeBlogPreview,
} from '@/components/home/home-blog-preview-card';
import {
  HomeRecipePreviewCard,
  type HomeRecipePreview,
} from '@/components/home/home-recipe-preview-card';
import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import type { RecipeCategory } from '@/constants/recipes';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc } from '@/lib/blog/firestore';
import { RECIPES_COLLECTION, type RecipeDoc } from '@/lib/recipes/firestore';
import { useRouter } from 'expo-router';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const RECIPES_PREVIEW = 3;
const BLOG_PREVIEW = 2;

function recipeToPreview(
  id: string,
  data: Omit<RecipeDoc, 'createdAt' | 'updatedAt'>,
): HomeRecipePreview | null {
  const category = data.category as RecipeCategory;
  return {
    id,
    title: data.title,
    imageUrl: data.imageUrl,
    category,
    prepTime: data.prepTime,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<HomeRecipePreview[]>([]);
  const [posts, setPosts] = useState<HomeBlogPreview[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState('');

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Hola';

  const loadFeed = useCallback(async () => {
    if (!isAuthenticated) {
      setRecipes([]);
      setPosts([]);
      setLoadingFeed(false);
      return;
    }
    setFeedError('');
    setLoadingFeed(true);
    try {
      const recipesQ = query(
        collection(db, RECIPES_COLLECTION),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc'),
        limit(RECIPES_PREVIEW),
      );
      const blogQ = query(
        collection(db, BLOG_POSTS_COLLECTION),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc'),
        limit(BLOG_PREVIEW),
      );

      const [recipesSnap, blogSnap] = await Promise.all([
        getDocs(recipesQ),
        getDocs(blogQ),
      ]);

      const nextRecipes: HomeRecipePreview[] = [];
      recipesSnap.forEach((d) => {
        const x = d.data() as Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;
        const p = recipeToPreview(d.id, x);
        if (p) nextRecipes.push(p);
      });

      const nextPosts: HomeBlogPreview[] = [];
      blogSnap.forEach((d) => {
        const full = d.data() as BlogPostDoc;
        nextPosts.push({
          id: d.id,
          title: full.title,
          excerpt: full.excerpt,
          coverImageUrl: full.coverImageUrl,
          author: full.author,
          updatedAt: full.updatedAt,
        });
      });

      setRecipes(nextRecipes);
      setPosts(nextPosts);
    } catch (e) {
      console.error('[HomeFeed]', e);
      setFeedError('No se pudo cargar el contenido.');
      setRecipes([]);
      setPosts([]);
    } finally {
      setLoadingFeed(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    loadFeed();
  }, [authLoading, loadFeed]);

  const onRefresh = useCallback(async () => {
    if (authLoading) return;
    setRefreshing(true);
    try {
      await loadFeed();
    } finally {
      setRefreshing(false);
    }
  }, [authLoading, loadFeed]);

  const goRecipe = (id: string) => {
    router.push({
      pathname: '/(tabs)/recipes/[recipeId]',
      params: { recipeId: id },
    });
  };

  const goBlog = (id: string) => {
    router.push({
      pathname: '/(tabs)/blog/[postId]',
      params: { postId: id },
    });
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Inicio</ThemedText>
        <ThemedText style={styles.greeting}>
          Hola, {displayName}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Recetas y lecturas para cuidarte
        </ThemedText>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.brand.primary}
            />
          }
        >
          {authLoading || loadingFeed ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color={palette.brand.primary}
            />
          ) : feedError ? (
            <ThemedText style={styles.error}>{feedError}</ThemedText>
          ) : !isAuthenticated ? (
            <ThemedText style={styles.muted}>
              Inicia sesión para ver recetas y artículos.
            </ThemedText>
          ) : (
            <>
              <View style={styles.sectionHead}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Recetas recientes
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/(tabs)/recipes')}
                  hitSlop={8}
                >
                  <ThemedText type="link" style={styles.sectionLink}>
                    Ver todas
                  </ThemedText>
                </Pressable>
              </View>
              {recipes.length === 0 ? (
                <ThemedText style={styles.empty}>
                  Aún no hay recetas publicadas.
                </ThemedText>
              ) : (
                recipes.map((r) => (
                  <HomeRecipePreviewCard
                    key={r.id}
                    recipe={r}
                    onVer={() => goRecipe(r.id)}
                  />
                ))
              )}

              <View style={[styles.sectionHead, styles.sectionHeadSecond]}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Artículos de salud
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/(tabs)/blog')}
                  hitSlop={8}
                >
                  <ThemedText type="link" style={styles.sectionLink}>
                    Ver todos
                  </ThemedText>
                </Pressable>
              </View>
              {posts.length === 0 ? (
                <ThemedText style={styles.empty}>
                  Aún no hay artículos publicados.
                </ThemedText>
              ) : (
                posts.map((p) => (
                  <HomeBlogPreviewCard
                    key={p.id}
                    post={p}
                    onVer={() => goBlog(p.id)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  greeting: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: palette.text.primary,
  },
  subtitle: {
    marginTop: 6,
    color: palette.text.secondary,
    fontSize: 15,
  },
  scroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    marginTop: 16,
    color: palette.semantic.error,
  },
  muted: {
    marginTop: 16,
    color: palette.text.muted,
  },
  empty: {
    marginTop: 8,
    marginBottom: 8,
    color: palette.text.muted,
    fontSize: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeadSecond: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    color: palette.text.primary,
  },
  sectionLink: {
    fontSize: 14,
  },
});
