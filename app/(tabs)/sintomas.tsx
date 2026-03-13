import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { StyleSheet, View } from 'react-native';

/**
 * Síntomas
 * - Lista de los síntomas del usuario
 * - Formulario para agregar síntomas
 */
export default function SintomasScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
      <ThemedText type="title">Síntomas</ThemedText>
      <ThemedText style={styles.subtitle}>
        Lista de síntomas y formulario para agregar nuevos
      </ThemedText>
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          [Lista de síntomas]
        </ThemedText>
        <ThemedText style={styles.placeholderText}>
          [Formulario agregar síntoma]
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
