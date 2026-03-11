import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { palette } from '@/constants/palette';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

/**
 * Perfil
 * - Formulario para editar perfil (nombre, email, etc.)
 */
export default function PerfilScreen() {
  const { user, email } = useAuth();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <ThemedText type="link">← Volver</ThemedText>
      </Pressable>
      <ThemedText type="title">Perfil</ThemedText>
      <ThemedText style={styles.subtitle}>
        Editar información personal
      </ThemedText>
      <View style={styles.placeholder}>
        <ThemedText style={styles.info}>
          {email ?? user?.email ?? '—'}
        </ThemedText>
        <ThemedText style={styles.placeholderText}>
          [Formulario: nombre, email, foto, etc.]
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
  back: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    color: palette.text.secondary,
  },
  info: {
    marginTop: 16,
    color: palette.text.primary,
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
