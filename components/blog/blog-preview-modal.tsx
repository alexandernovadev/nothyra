import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { RECIPE_STATUS_LABELS_ES } from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { formatBlogPostDate } from '@/lib/blog/format-date';
import type { BlogPostListItem } from '@/lib/blog/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  post: BlogPostListItem | null;
  onClose: () => void;
  showStatus?: boolean;
};

export function BlogPreviewModal({ visible, post, onClose, showStatus }: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const sheetMax = Math.min(winH * 0.88, 720);
  const footerH = 84 + Math.max(insets.bottom, 8);
  const grabberH = 28;
  const scrollMax = Math.max(200, sheetMax - footerH - grabberH);

  if (!post) {
    return null;
  }

  const dateLabel = formatBlogPostDate(post.updatedAt);
  const paragraphs = (post.content ?? []).filter((p) => p.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar vista previa"
        />
        <View
          style={[
            styles.sheet,
            {
              marginBottom: Math.max(insets.bottom, 10),
              maxHeight: sheetMax,
            },
          ]}
        >
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>

          <ScrollView
            style={[styles.scroll, { maxHeight: scrollMax }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces
            nestedScrollEnabled
          >
            <View style={styles.heroWrap}>
              {post.coverImageUrl ? (
                <Image
                  source={{ uri: post.coverImageUrl }}
                  style={styles.hero}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.hero, styles.heroEmpty]}>
                  <Ionicons name="newspaper-outline" size={48} color={palette.text.muted} />
                </View>
              )}
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(255, 255, 255, 0.92)']}
                style={styles.heroFade}
              />
            </View>

            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={4}>
                {post.title}
              </Text>

              {showStatus ? (
                <View
                  style={[
                    styles.statusPill,
                    post.status === 'published' ? styles.statusPub : styles.statusDraft,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      post.status === 'published' && styles.statusPillTextPub,
                    ]}
                  >
                    {RECIPE_STATUS_LABELS_ES[post.status]}
                  </Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <MetaChip icon="person-outline" label={post.author} />
                {dateLabel ? <MetaChip icon="calendar-outline" label={dateLabel} /> : null}
              </View>

              {post.excerpt ? (
                <View style={styles.descBlock}>
                  <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                    Resumen
                  </ThemedText>
                  <ThemedText style={styles.desc}>{post.excerpt}</ThemedText>
                </View>
              ) : null}

              {paragraphs.length > 0 ? (
                <View style={styles.block}>
                  <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                    Contenido
                  </ThemedText>
                  {paragraphs.map((para, i) => (
                    <Text key={i} style={styles.para}>
                      {para}
                    </Text>
                  ))}
                </View>
              ) : null}

              {(post.tags ?? []).length > 0 ? (
                <View style={styles.tagsBlock}>
                  <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                    Etiquetas
                  </ThemedText>
                  <View style={styles.tagsRow}>
                    {(post.tags ?? []).slice(0, 12).map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Btn fullWidth style={styles.btnClose} onPress={onClose}>
              <ThemedText type="defaultSemiBold" style={styles.btnCloseText}>
                Cerrar
              </ThemedText>
            </Btn>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={14} color={palette.brand.primary} />
      <Text style={styles.metaChipText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 25, 45, 0.52)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: palette.surface.formSheet,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.surface.panelTranslucentBorder,
    overflow: 'hidden',
    zIndex: 1,
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border.light,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 168,
    backgroundColor: palette.surface.input,
  },
  heroEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text.primary,
    letterSpacing: -0.3,
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPub: {
    backgroundColor: palette.brand.secondaryMuted,
  },
  statusDraft: {
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.text.secondary,
  },
  statusPillTextPub: {
    color: palette.brand.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: palette.brand.primaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.primaryBorderSoft,
    maxWidth: '100%',
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.brand.primary,
    flexShrink: 1,
  },
  descBlock: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  block: {
    marginTop: 16,
  },
  blockTitle: {
    fontSize: 14,
    color: palette.text.primary,
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.text.secondary,
  },
  para: {
    fontSize: 15,
    lineHeight: 24,
    color: palette.text.primary,
    marginBottom: 14,
  },
  tagsBlock: {
    marginTop: 16,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: palette.semantic.infoMuted,
    borderWidth: 1,
    borderColor: palette.semantic.infoBorderSoft,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.semantic.info,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border.light,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  btnClose: {
    backgroundColor: palette.brand.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnCloseText: {
    color: palette.text.inverse,
  },
});
