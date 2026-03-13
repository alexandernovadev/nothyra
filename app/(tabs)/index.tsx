import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Home
 * - Información de enfermedades (genérico)
 */
export default function HomeScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <ThemedText style={styles.subtitle}>
        Información de enfermedades
      </ThemedText>
      <ScrollView style={styles.scroll}>
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            [Contenido genérico sobre enfermedades]
          </ThemedText>
          <ThemedText style={styles.placeholderText}>
            Artículos, categorías, recursos de salud...
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
    marginTop: 8,
    color: palette.text.secondary,
  },
  scroll: {
    marginTop: 24,
  },
  placeholder: {
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
