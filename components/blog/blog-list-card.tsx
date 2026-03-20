import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
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
};

export function BlogListCard({ post, onOpenDetail, onOpenSummary }: Props) {
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
              <Ionicons name="newspaper-outline" size={40} color={palette.text.muted} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.excerpt} numberOfLines={3}>
            {post.excerpt}
          </Text>
          <Text style={styles.meta}>
            {post.author}
            {dateLabel ? ` · ${dateLabel}` : ''}
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
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text.primary,
  },
  excerpt: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: palette.text.muted,
  },
  summaryBtnWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
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
