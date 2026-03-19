import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

function getInitials(displayName: string | null | undefined, email: string | null | undefined): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  if (email) {
    const letter = email[0];
    return letter ? letter.toUpperCase() : '?';
  }
  return '?';
}

/**
 * More tab: avatar initials, name, email, role; link to profile; logout.
 */
export default function MoreScreen() {
  const { logout, email, user, role } = useAuth();
  const router = useRouter();
  const displayName = user?.displayName ?? '';
  const initials = getInitials(displayName, email);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Más</ThemedText>
        <ScrollView style={styles.scroll}>
          <View style={styles.profileRow}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.profileName}>
                {displayName || 'Sin nombre'}
              </ThemedText>
              {email ? (
                <ThemedText style={styles.profileEmail}>{email}</ThemedText>
              ) : null}
              <ThemedText style={styles.roleText}>
                Rol: {roleLabel}
              </ThemedText>
            </View>
          </View>

          <Btn
            style={styles.editBtn}
            onPress={() => router.push('/(tabs)/more/profile')}
          >
            <ThemedText type="defaultSemiBold" style={styles.editBtnText}>
              Editar 
            </ThemedText>
          </Btn>

          <Btn style={styles.logoutBtn} onPress={handleLogout}>
            <ThemedText type="defaultSemiBold" style={styles.logoutBtnText}>
              Cerrar sesión
            </ThemedText>
          </Btn>

          <ThemedText style={styles.version}>Versión {appVersion}</ThemedText>
        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    marginTop: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: palette.text.inverse,
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: palette.text.primary,
  },
  profileEmail: {
    marginTop: 2,
    fontSize: 14,
    color: palette.text.secondary,
  },
  roleText: {
    marginTop: 4,
    fontSize: 13,
    color: palette.text.muted,
  },
  editBtn: {
    width: '100%',
    backgroundColor: palette.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  editBtnText: {
    color: palette.text.inverse,
    width: '100%',
    textAlign: 'center',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: palette.semantic.error,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    marginTop: 8,
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
