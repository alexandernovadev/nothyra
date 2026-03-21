import { RecipeListCard } from '@/components/recipes/recipe-list-card';
import { RecipePreviewModal } from '@/components/recipes/recipe-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { db } from '@/lib/firebase';
import { RECIPES_COLLECTION, type RecipeDoc } from '@/lib/recipes/firestore';
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

type Row = {
  id: string;
} & Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;

export default function RecipesPublicListScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewRecipe, setPreviewRecipe] = useState<Row | null>(null);

  useEffect(() => {
    setError('');
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(80),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Row[] = snap.docs.map((d) => {
          const x = d.data() as Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;
          return { id: d.id, ...x };
        });
        setRows(next);
        setLoading(false);
      },
      (err) => {
        console.error('[RecipesPublicList]', err);
        setError('No se pudieron cargar las recetas.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const goToRecipeDetail = useCallback(
    (id: string) => {
      setPreviewRecipe(null);
      queueMicrotask(() => {
        router.push({
          pathname: './[recipeId]',
          params: { recipeId: id },
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
        <ThemedText type="title">Recetas</ThemedText>
        <ThemedText style={styles.hint}>Recetas publicadas por el equipo</ThemedText>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={palette.brand.primary}
          />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : rows.length === 0 ? (
          <ThemedText style={styles.empty}>Aún no hay recetas publicadas.</ThemedText>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {rows.map((r) => (
              <RecipeListCard
                key={r.id}
                recipe={r}
                onOpenDetail={() => goToRecipeDetail(r.id)}
                onOpenSummary={() => setPreviewRecipe(r)}
              />
            ))}
          </ScrollView>
        )}

        <RecipePreviewModal
          visible={previewRecipe !== null}
          recipe={previewRecipe}
          onClose={() => setPreviewRecipe(null)}
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
