import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Reminders tab: medications / pill schedules (placeholder).
 */
export default function RemindersScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Recordatorio</ThemedText>
        <ThemedText style={styles.subtitle}>
          Recordatorios de píldoras y medicamentos
        </ThemedText>

        <ScrollView style={styles.scroll}>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              [Lista de medicamentos]
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              [Horarios y alertas]
            </ThemedText>
          </View>

        </ScrollView>
      </View> 
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    color: palette.text.secondary,
  },
  scroll: {
    zIndex: 9999,
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
