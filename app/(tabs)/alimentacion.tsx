import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { palette } from '@/constants/palette';
import { StyleSheet, View } from 'react-native';

/**
 * Plan de alimentación
 * - Tarjetas de recetas/comidas
 * - Formulario para agregar
 */
export default function AlimentacionScreen() {
  return (
    <ThemedView style={styles.container}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
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
