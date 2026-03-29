import { RecipeListCard } from '@/components/recipes/recipe-list-card';
import { RecipePreviewModal } from '@/components/recipes/recipe-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import {
  RECIPE_CATEGORIES,
  RECIPE_CATEGORY_LABELS_ES,
  type RecipeCategory,
} from '@/constants/recipes';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Row = {
  id: string;
} & Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;

type CategoryFilter = 'all' | RecipeCategory;

export default function NutritionScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewRecipe, setPreviewRecipe] = useState<Row | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    setError('');
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(120),
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
        console.error('[NutritionList]', err);
        setError('No se pudieron cargar las comidas.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filteredRows = useMemo(() => {
    if (selectedCategory === 'all') return rows;
    return rows.filter((row) => row.category === selectedCategory);
  }, [rows, selectedCategory]);

  const goToRecipeDetail = useCallback(
    (id: string) => {
      setPreviewRecipe(null);
      queueMicrotask(() => {
        router.push({
          pathname: '/(tabs)/recipes/[recipeId]',
          params: { recipeId: id },
        });
      });
    },
    [router],
  );

  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Plan de alimentación</ThemedText>
        <ThemedText style={styles.subtitle}>
          Filtra por tipo de comida
        </ThemedText>

        <View style={styles.chipsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            <Pressable
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.chip,
                selectedCategory === 'all' && styles.chipOn,
              ]}
            >
              <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextOn]}>
                Todas
              </Text>
            </Pressable>
            {RECIPE_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.chip,
                  selectedCategory === category && styles.chipOn,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === category && styles.chipTextOn,
                  ]}
                >
                  {RECIPE_CATEGORY_LABELS_ES[category]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={palette.brand.primary}
          />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : filteredRows.length === 0 ? (
          <ThemedText style={styles.empty}>
            No hay comidas para esta categoría.
          </ThemedText>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredRows.map((row) => (
              <RecipeListCard
                key={row.id}
                recipe={row}
                onOpenDetail={() => goToRecipeDetail(row.id)}
                onOpenSummary={() => setPreviewRecipe(row)}
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
  container: { flex: 1 },
  subtitle: {
    marginTop: 8,
    color: palette.text.secondary,
  },
  chipsWrap: {
    marginTop: 14,
  },
  chipsContent: {
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: palette.surface.input,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  chipOn: {
    borderColor: palette.brand.primary,
    backgroundColor: palette.brand.primaryChipFill,
  },
  chipText: {
    fontSize: 13,
    color: palette.text.secondary,
  },
  chipTextOn: {
    color: palette.brand.primary,
    fontWeight: '700',
  },
  loader: { marginTop: 32 },
  error: { marginTop: 16, color: palette.semantic.error },
  empty: { marginTop: 24, color: palette.text.muted },
  list: { flex: 1, marginTop: 12 },
  listContent: { paddingBottom: 24 },
});
