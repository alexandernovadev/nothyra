import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { palette } from '@/constants/palette';
import {
  RECIPE_CATEGORY_LABELS_ES,
  RECIPE_DIFFICULTY_LABELS_ES,
  RECIPE_STATUS_LABELS_ES,
} from '@/constants/recipes';
import type { RecipeListItem } from '@/lib/recipes/firestore';
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

const ING_PREVIEW = 6;

type Props = {
  visible: boolean;
  recipe: RecipeListItem | null;
  onClose: () => void;
  /** Si true, muestra estado (borrador / publicada) */
  showStatus?: boolean;
};

export function RecipePreviewModal({
  visible,
  recipe,
  onClose,
  showStatus,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const sheetMax = Math.min(winH * 0.88, 720);
  const footerH = 84 + Math.max(insets.bottom, 8);
  const grabberH = 28;
  const scrollMax = Math.max(200, sheetMax - footerH - grabberH);

  if (!recipe) {
    return null;
  }

  const ingredients = (recipe.ingredients ?? []).filter((i) => i.name.trim());
  const steps = (recipe.steps ?? []).filter((s) => s.trim());
  const ingShown = ingredients.slice(0, ING_PREVIEW);
  const ingMore = Math.max(0, ingredients.length - ingShown.length);

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
                {recipe.imageUrl ? (
                  <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.hero}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.hero, styles.heroEmpty]}>
                    <Ionicons name="restaurant-outline" size={48} color={palette.text.muted} />
                  </View>
                )}
                <LinearGradient
                  pointerEvents="none"
                  colors={['transparent', 'rgba(255, 255, 255, 0.92)']}
                  style={styles.heroFade}
                />
              </View>

              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={3}>
                  {recipe.title}
                </Text>

                {showStatus ? (
                  <View
                    style={[
                      styles.statusPill,
                      recipe.status === 'published' ? styles.statusPub : styles.statusDraft,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        recipe.status === 'published' && styles.statusPillTextPub,
                      ]}
                    >
                      {RECIPE_STATUS_LABELS_ES[recipe.status]}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <MetaChip
                    icon="folder-outline"
                    label={RECIPE_CATEGORY_LABELS_ES[recipe.category]}
                  />
                  <MetaChip icon="time-outline" label={`${recipe.prepTime} min`} />
                  <MetaChip
                    icon="speedometer-outline"
                    label={RECIPE_DIFFICULTY_LABELS_ES[recipe.difficulty]}
                  />
                  <MetaChip icon="people-outline" label={`${recipe.servings} porc.`} />
                </View>

                {recipe.description ? (
                  <View style={styles.descBlock}>
                    <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                      Resumen
                    </ThemedText>
                    <ThemedText style={styles.desc}>{recipe.description}</ThemedText>
                  </View>
                ) : null}

                {ingShown.length > 0 ? (
                  <View style={styles.block}>
                    <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                      Ingredientes
                      {ingredients.length > ingShown.length
                        ? ` (${ingredients.length})`
                        : ''}
                    </ThemedText>
                    {ingShown.map((ing, i) => (
                      <View key={`${ing.name}-${i}`} style={styles.ingRow}>
                        <View style={styles.ingBullet} />
                        <Text style={styles.ingText} numberOfLines={2}>
                          <Text style={styles.ingName}>{ing.name}</Text>
                          {ing.quantity ? (
                            <Text style={styles.ingQty}> · {ing.quantity}</Text>
                          ) : null}
                        </Text>
                      </View>
                    ))}
                    {ingMore > 0 ? (
                      <ThemedText style={styles.moreHint}>+{ingMore} ingredientes más</ThemedText>
                    ) : null}
                  </View>
                ) : null}

                {steps.length > 0 ? (
                  <View style={styles.block}>
                    <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                      Preparación
                    </ThemedText>
                    {steps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}>
                          <Text style={styles.stepNumText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {(recipe.tags ?? []).length > 0 ? (
                  <View style={styles.tagsBlock}>
                    <ThemedText type="defaultSemiBold" style={styles.blockTitle}>
                      Etiquetas
                    </ThemedText>
                    <View style={styles.tagsRow}>
                      {(recipe.tags ?? []).slice(0, 12).map((t) => (
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
  ingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  ingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: palette.brand.secondary,
  },
  ingText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  ingName: {
    fontWeight: '600',
  },
  ingQty: {
    fontWeight: '400',
    color: palette.text.secondary,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: palette.text.primary,
  },
  moreHint: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
    color: palette.text.muted,
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
