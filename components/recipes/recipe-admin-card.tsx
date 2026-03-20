import {
  RECIPE_CATEGORY_LABELS_ES,
  RECIPE_DIFFICULTY_LABELS_ES,
  RECIPE_STATUS_LABELS_ES,
} from '@/constants/recipes';
import type { RecipeListItem } from '@/lib/recipes/firestore';
import { palette } from '@/constants/palette';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  recipe: RecipeListItem;
  onOpenDetail: () => void;
  onOpenSummary: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function RecipeAdminCard({
  recipe,
  onOpenDetail,
  onOpenSummary,
  onEdit,
  onDelete,
}: Props) {
  const published = recipe.status === 'published';

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
              <Ionicons name="image-outline" size={32} color={palette.text.muted} />
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
          <View style={[styles.badge, published ? styles.badgeOn : styles.badgeDraft]}>
            <Text style={[styles.badgeText, published ? styles.badgeTextOn : undefined]}>
              {RECIPE_STATUS_LABELS_ES[recipe.status]}
            </Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={onOpenSummary} style={styles.actionBtn} hitSlop={6}>
          <Ionicons name="document-text-outline" size={20} color={palette.brand.primary} />
          <Text style={[styles.actionLabel, styles.actionView]}>Resumen</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.actionBtn} hitSlop={6}>
          <Ionicons name="pencil-outline" size={20} color={palette.semantic.warning} />
          <Text style={styles.actionLabel}>Editar</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionBtn} hitSlop={6}>
          <Ionicons name="trash-outline" size={20} color={palette.semantic.error} />
          <Text style={[styles.actionLabel, styles.actionDelete]}>Eliminar</Text>
        </Pressable>
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
    height: 120,
    width: '100%',
    backgroundColor: palette.surface.input,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 0 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text.primary,
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: palette.text.secondary,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeOn: {
    backgroundColor: palette.brand.secondaryMuted,
  },
  badgeDraft: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.text.secondary,
  },
  badgeTextOn: {
    color: palette.brand.secondary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text.primary,
  },
  actionView: {
    color: palette.brand.primary,
  },
  actionDelete: {
    color: palette.semantic.error,
  },
});
