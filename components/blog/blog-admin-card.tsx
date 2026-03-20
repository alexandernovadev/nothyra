import { RECIPE_STATUS_LABELS_ES } from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { formatBlogPostDate } from '@/lib/blog/format-date';
import type { BlogPostListItem } from '@/lib/blog/firestore';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  post: BlogPostListItem;
  onOpenDetail: () => void;
  onOpenSummary: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BlogAdminCard({
  post,
  onOpenDetail,
  onOpenSummary,
  onEdit,
  onDelete,
}: Props) {
  const published = post.status === 'published';
  const dateLabel = formatBlogPostDate(post.updatedAt);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onOpenDetail}
        style={({ pressed }) => [styles.cardMain, pressed && styles.cardMainPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir artículo: ${post.title}`}
      >
        <View style={styles.imageWrap}>
          {post.coverImageUrl ? (
            <Image
              source={{ uri: post.coverImageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="newspaper-outline" size={32} color={palette.text.muted} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.excerpt} numberOfLines={2}>
            {post.excerpt}
          </Text>
          <Text style={styles.meta}>
            {post.author}
            {dateLabel ? ` · ${dateLabel}` : ''}
          </Text>
          <View style={[styles.badge, published ? styles.badgeOn : styles.badgeDraft]}>
            <Text style={[styles.badgeText, published ? styles.badgeTextOn : undefined]}>
              {RECIPE_STATUS_LABELS_ES[post.status]}
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
  excerpt: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: palette.text.secondary,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: palette.text.muted,
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
