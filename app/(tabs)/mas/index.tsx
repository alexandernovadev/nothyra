import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { palette } from '@/constants/palette';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

/**
 * Más
 * - Versión de la app
 * - Botón logout
 * - Perfil => formulario editar perfil
 */
export default function MasScreen() {
  const { logout, email } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Más</ThemedText>
      <ScrollView style={styles.scroll}>
        <Pressable
          style={styles.row}
          onPress={() => router.push('/(tabs)/mas/perfil')}
        >
          <ThemedText type="defaultSemiBold">Perfil</ThemedText>
          <ThemedText style={styles.rowSubtext}>{email ?? 'Editar perfil'}</ThemedText>
        </Pressable>

        <Pressable style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
          <ThemedText type="defaultSemiBold" style={styles.logoutText}>
            Cerrar sesión
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.version}>Versión 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  scroll: {
    marginTop: 24,
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.light,
  },
  rowSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: palette.text.secondary,
  },
  logoutRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutText: {
    color: palette.semantic.error,
  },
  version: {
    marginTop: 32,
    fontSize: 14,
    color: palette.text.muted,
  },
});
