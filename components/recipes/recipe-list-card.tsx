import {
  RECIPE_CATEGORY_LABELS_ES,
  RECIPE_DIFFICULTY_LABELS_ES,
} from '@/constants/recipes';
import type { RecipeListItem } from '@/lib/recipes/firestore';
import { palette } from '@/constants/palette';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  recipe: RecipeListItem;
  /** Pantalla con ingredientes y pasos al completo */
  onOpenDetail: () => void;
  /** Modal solo con resumen */
  onOpenSummary: () => void;
};

export function RecipeListCard({ recipe, onOpenDetail, onOpenSummary }: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onOpenDetail}
        style={({ pressed }) => [styles.cardMain, pressed && styles.cardMainPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir receta: ${recipe.title}`}
      >
        <View style={styles.imageWrap}>
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={palette.text.muted} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.meta}>
            {RECIPE_CATEGORY_LABELS_ES[recipe.category]} · {recipe.prepTime} min ·{' '}
            {RECIPE_DIFFICULTY_LABELS_ES[recipe.difficulty]}
          </Text>
        </View>
      </Pressable>
      <View style={styles.summaryBtnWrap}>
        <Btn fullWidth style={styles.summaryBtn} onPress={onOpenSummary}>
          <ThemedText type="defaultSemiBold" style={styles.summaryBtnText}>
            Resumen
          </ThemedText>
        </Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border.light,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardMain: { width: '100%' },
  cardMainPressed: { opacity: 0.94 },
  imageWrap: {
    height: 140,
    width: '100%',
    backgroundColor: palette.surface.input,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },
  summaryBtnWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text.primary,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: palette.text.secondary,
  },
  summaryBtn: {
    backgroundColor: palette.brand.primaryMuted,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.brand.primaryBorderSoft,
  },
  summaryBtnText: {
    color: palette.brand.primary,
    fontSize: 15,
  },
});
