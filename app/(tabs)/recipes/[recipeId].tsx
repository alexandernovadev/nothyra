import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import {
  RECIPE_CATEGORY_LABELS_ES,
  RECIPE_DIFFICULTY_LABELS_ES,
} from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { db } from '@/lib/firebase';
import { RECIPES_COLLECTION, type RecipeDoc } from '@/lib/recipes/firestore';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function RecipePublicDetailScreen() {
  const raw = useLocalSearchParams<{ recipeId?: string | string[] }>();
  const rid = raw.recipeId;
  const recipeId = Array.isArray(rid) ? rid[0] : rid;
  const router = useRouter();
  const [recipe, setRecipe] = useState<
    (Omit<RecipeDoc, 'createdAt' | 'updatedAt'> & { id: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!recipeId || typeof recipeId !== 'string' || recipeId.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const snap = await getDoc(doc(db, RECIPES_COLLECTION, recipeId));
      if (!snap.exists()) {
        setNotFound(true);
        setRecipe(null);
        return;
      }
      const d = snap.data() as Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;
      if (d.status !== 'published') {
        setNotFound(true);
        setRecipe(null);
        return;
      }
      setRecipe({ id: snap.id, ...d });
    } catch (e) {
      console.error('[RecipePublicDetail]', e);
      setNotFound(true);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    load();
  }, [load]);

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
        ) : notFound || !recipe ? (
          <ThemedText style={styles.error}>
            Receta no disponible o no publicada.
          </ThemedText>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentSheet}>
              {recipe.imageUrl ? (
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.hero}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.hero, styles.heroPlaceholder]} />
              )}
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.meta}>
                {RECIPE_CATEGORY_LABELS_ES[recipe.category]} · {recipe.prepTime} min ·{' '}
                {RECIPE_DIFFICULTY_LABELS_ES[recipe.difficulty]} · {recipe.servings}{' '}
                porciones
              </Text>
              {recipe.description ? (
                <ThemedText style={styles.desc}>{recipe.description}</ThemedText>
              ) : null}

              <ThemedText type="defaultSemiBold" style={styles.section}>
                Ingredientes
              </ThemedText>
              {(recipe.ingredients ?? []).map((ing, i) => (
                <Text key={i} style={styles.line}>
                  • {ing.name} — {ing.quantity}
                </Text>
              ))}

              <ThemedText type="defaultSemiBold" style={styles.section}>
                Preparación
              </ThemedText>
              {(recipe.steps ?? []).map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepNum}>{i + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              {(recipe.tags ?? []).length > 0 ? (
                <View style={styles.tags}>
                  {(recipe.tags ?? []).map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
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
  scrollContent: { paddingBottom: 32, paddingTop: 4 },
  contentSheet: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: palette.surface.formSheet,
    borderWidth: 1,
    borderColor: palette.surface.panelTranslucentBorder,
    overflow: 'hidden',
  },
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
  desc: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 17,
    color: palette.brand.primary,
  },
  line: {
    fontSize: 15,
    color: palette.text.primary,
    marginBottom: 6,
  },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  stepNum: { width: 24, fontWeight: '700', color: palette.text.secondary },
  stepText: { flex: 1, fontSize: 15, color: palette.text.primary, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: palette.semantic.infoMuted,
  },
  tagText: { fontSize: 12, color: palette.semantic.info },
});
