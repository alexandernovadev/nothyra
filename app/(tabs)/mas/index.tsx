import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Btn } from '@/components/ui/btn';
import { useAuth } from '@/contexts/auth-context';
import { palette } from '@/constants/palette';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

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
        <Btn
          style={styles.row}
          onPress={() => router.push('/(tabs)/mas/perfil')}
        >
          <ThemedText type="defaultSemiBold">Perfil</ThemedText>
          <ThemedText style={styles.rowSubtext}>{email ?? 'Editar perfil'}</ThemedText>
        </Btn>

        <Btn style={styles.logoutBtn} onPress={handleLogout}>
          <ThemedText type="defaultSemiBold" style={styles.logoutBtnText}>
            Cerrar sesión
          </ThemedText>
        </Btn>

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
  logoutBtn: {
    width: '100%',
    backgroundColor: palette.semantic.error,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutBtnText: {
    color: palette.text.inverse,
  },
  version: {
    marginTop: 32,
    fontSize: 14,
    color: palette.text.muted,
  },
});
