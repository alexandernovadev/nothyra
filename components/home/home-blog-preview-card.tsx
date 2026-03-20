import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { palette } from '@/constants/palette';
import { formatBlogPostDate } from '@/lib/blog/format-date';
import type { Timestamp } from 'firebase/firestore';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export type HomeBlogPreview = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  updatedAt?: Timestamp;
};

type Props = {
  post: HomeBlogPreview;
  onVer: () => void;
};

export function HomeBlogPreviewCard({ post, onVer }: Props) {
  const dateLabel = formatBlogPostDate(post.updatedAt);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {post.coverImageUrl ? (
          <Image
            source={{ uri: post.coverImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="newspaper-outline" size={36} color={palette.text.muted} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Ionicons name="heart-outline" size={12} color={palette.brand.secondary} />
          <Text style={styles.badgeText}>Salud</Text>
        </View>
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
        <Btn fullWidth style={styles.verBtn} onPress={onVer}>
          <ThemedText type="defaultSemiBold" style={styles.verBtnText}>
            Ver artículo
          </ThemedText>
        </Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: palette.surface.formSheet,
    borderWidth: 1,
    borderColor: palette.surface.panelTranslucentBorder,
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageWrap: {
    height: 120,
    width: '100%',
    backgroundColor: palette.surface.input,
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: palette.brand.secondaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.secondaryBorderSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text.primary,
    letterSpacing: -0.2,
  },
  excerpt: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: palette.text.secondary,
  },
  meta: {
    marginTop: 10,
    fontSize: 13,
    color: palette.text.muted,
  },
  verBtn: {
    marginTop: 12,
    backgroundColor: palette.brand.secondary,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  verBtnText: {
    color: palette.text.inverse,
    fontSize: 15,
  },
});
