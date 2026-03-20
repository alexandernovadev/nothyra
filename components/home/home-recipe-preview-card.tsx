import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import {
  RECIPE_CATEGORY_LABELS_ES,
  type RecipeCategory,
} from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export type HomeRecipePreview = {
  id: string;
  title: string;
  imageUrl: string;
  category: RecipeCategory;
  prepTime: number;
};

type Props = {
  recipe: HomeRecipePreview;
  onVer: () => void;
};

export function HomeRecipePreviewCard({ recipe, onVer }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="restaurant-outline" size={36} color={palette.text.muted} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.meta}>
          {RECIPE_CATEGORY_LABELS_ES[recipe.category]} · {recipe.prepTime} min
        </Text>
        <Btn fullWidth style={styles.verBtn} onPress={onVer}>
          <ThemedText type="defaultSemiBold" style={styles.verBtnText}>
            Ver receta
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
    height: 132,
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
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text.primary,
    letterSpacing: -0.2,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: palette.text.secondary,
  },
  verBtn: {
    marginTop: 12,
    backgroundColor: palette.brand.primary,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  verBtnText: {
    color: palette.text.inverse,
    fontSize: 15,
  },
});
