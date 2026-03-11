import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { palette } from '@/constants/palette';
import { StyleSheet, View } from 'react-native';

/**
 * Recordatorio (píldora)
 * - Recordatorios de medicamentos
 * - Horarios de toma
 */
export default function RecordatorioScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Recordatorio</ThemedText>
      <ThemedText style={styles.subtitle}>
        Recordatorios de píldoras y medicamentos
      </ThemedText>
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          [Lista de medicamentos]
        </ThemedText>
        <ThemedText style={styles.placeholderText}>
          [Horarios y alertas]
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
