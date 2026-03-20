import { RecipeForm } from '@/components/recipes/recipe-form';
import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { recipeDocToFormData } from '@/lib/recipes/map-doc';
import { RECIPES_COLLECTION, type RecipeDoc } from '@/lib/recipes/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Crear (`/form`) o editar (`/form?id=docId`) — solo admin.
 */
export default function RecipeFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const recipeId = typeof id === 'string' && id.length > 0 ? id : undefined;

  const [ready, setReady] = useState(!recipeId);
  const [notFound, setNotFound] = useState(false);
  const [initial, setInitial] = useState<ReturnType<typeof recipeDocToFormData> | null>(
    null,
  );

  const load = useCallback(async () => {
    if (!recipeId) {
      setReady(true);
      return;
    }
    try {
      const snap = await getDoc(doc(db, RECIPES_COLLECTION, recipeId));
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      const d = snap.data() as Omit<RecipeDoc, 'createdAt' | 'updatedAt'>;
      setInitial(recipeDocToFormData(d));
      setNotFound(false);
    } catch (e) {
      console.error('[RecipeFormScreen]', e);
      setNotFound(true);
    } finally {
      setReady(true);
    }
  }, [recipeId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace('/(tabs)/more/recipes');
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

  if (recipeId && !ready) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.brand.primary} />
        </View>
      </MainLayout>
    );
  }

  if (recipeId && (notFound || !initial)) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ThemedText style={styles.err}>Receta no encontrada.</ThemedText>
        </View>
      </MainLayout>
    );
  }

  if (recipeId && initial) {
    return <RecipeForm mode="edit" recipeId={recipeId} initialValues={initial} />;
  }

  return <RecipeForm mode="create" />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: palette.semantic.error, textAlign: 'center' },
});
