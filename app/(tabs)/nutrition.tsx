import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { StyleSheet, View } from 'react-native';

/**
 * Nutrition tab: meal / recipe cards and add form (placeholder).
 */
export default function NutritionScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
      <ThemedText type="title">Plan de alimentación</ThemedText>
      <ThemedText style={styles.subtitle}>
        Tarjetas de comidas y formulario para agregar
      </ThemedText>
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          [Tarjetas de recetas]
        </ThemedText>
        <ThemedText style={styles.placeholderText}>
          [Formulario agregar comida/receta]
        </ThemedText>
      </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    marginTop: 8,
    color: palette.text.secondary,
  },
  placeholder: {
    marginTop: 24,
    padding: 16,
    backgroundColor: palette.surface.input,
    borderRadius: 12,
    gap: 12,
  },
  placeholderText: {
    color: palette.text.muted,
    fontStyle: 'italic',
  },
});
