import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import {
  REMINDERS_COLLECTION,
  formatReminderTime,
  type ReminderListItem,
} from '@/lib/reminders/firestore';
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from '@/lib/reminders/notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/lib/firebase';

const TAB_BAR_CLEARANCE = 56;

export default function RemindersListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<ReminderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  useEffect(() => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setListError('');
    setLoading(true);

    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('userId', '==', user.uid),
      limit(100),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs
          .map((d) => {
            const x = d.data() as Omit<ReminderListItem, 'id'>;
            return { id: d.id, ...x };
          })
          .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
        setRows(next);
        setLoading(false);
      },
      (err) => {
        console.error('[RemindersList]', err);
        setListError('No se pudo cargar la lista de recordatorios.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const confirmDelete = (id: string, label: string) => {
    Alert.alert('Eliminar recordatorio', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const target = rows.find((x) => x.id === id);
            await deleteDoc(doc(db, REMINDERS_COLLECTION, id));
            await cancelReminderNotification(target?.notificationId);
          } catch (e) {
            console.error('[ReminderDelete]', e);
            Alert.alert('Error', 'No se pudo eliminar el recordatorio.');
          }
        },
      },
    ]);
  };

  const toggleEnabled = async (row: ReminderListItem) => {
    try {
      if (row.enabled) {
        await updateDoc(doc(db, REMINDERS_COLLECTION, row.id), {
          enabled: false,
          notificationId: null,
          updatedAt: serverTimestamp(),
        });
        await cancelReminderNotification(row.notificationId);
      } else {
        let nextNotificationId: string | null = null;
        try {
          nextNotificationId = await scheduleReminderNotification({
            label: row.label,
            hour: row.hour,
            minute: row.minute,
          });
          await updateDoc(doc(db, REMINDERS_COLLECTION, row.id), {
            enabled: true,
            notificationId: nextNotificationId,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          if (nextNotificationId) {
            await cancelReminderNotification(nextNotificationId);
          }
          throw error;
        }
      }
    } catch (e) {
      console.error('[ReminderToggle]', e);
      Alert.alert(
        'Error',
        e instanceof Error && e.message.includes('permiso')
          ? 'Activa permisos de notificaciones para usar recordatorios activos.'
          : 'No se pudo actualizar el recordatorio.',
      );
    }
  };

  const fabBottom = insets.bottom + TAB_BAR_CLEARANCE;
  const fabRight = Math.max(insets.right, 8);

  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Recordatorios</ThemedText>
        <ThemedText style={styles.subtitle}>
          Crea horarios para no olvidar tus tomas
        </ThemedText>
        {listError ? <ThemedText style={styles.errorText}>{listError}</ThemedText> : null}

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={palette.brand.primary} />
          </View>
        ) : (
          <View style={styles.listWrap}>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              {rows.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-outline" size={38} color={palette.brand.primary} />
                  <ThemedText style={styles.emptyTitle}>
                    Aún no tienes recordatorios
                  </ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    Pulsa + para crear uno nuevo.
                  </ThemedText>
                </View>
              ) : (
                rows.map((row) => (
                  <View key={row.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.timeText}>
                        {formatReminderTime(row.hour, row.minute)}
                      </Text>
                      <View style={styles.actions}>
                        <Pressable
                          onPress={() => confirmDelete(row.id, row.label)}
                          hitSlop={8}
                          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressedDelete]}
                        >
                          <Ionicons name="trash-outline" size={18} color={palette.semantic.error} />
                        </Pressable>
                        <Pressable
                          onPress={() => router.push(`/(tabs)/reminders/${row.id}`)}
                          hitSlop={8}
                          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressedEdit]}
                        >
                          <Ionicons name="pencil-outline" size={18} color={palette.semantic.warning} />
                        </Pressable>
                      </View>
                    </View>
                    <ThemedText style={styles.labelText}>{row.label}</ThemedText>
                    <Pressable
                      onPress={() => toggleEnabled(row)}
                      style={[styles.statusChip, row.enabled && styles.statusChipOn]}
                    >
                      <ThemedText style={[styles.statusChipText, row.enabled && styles.statusChipTextOn]}>
                        {row.enabled ? 'Activo' : 'Desactivado'}
                      </ThemedText>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        <Pressable
          accessibilityLabel="Crear recordatorio"
          onPress={() => router.push('/(tabs)/reminders/new')}
          style={({ pressed }) => [
            styles.fab,
            { bottom: fabBottom, right: fabRight },
            pressed && styles.fabPressed,
          ]}
        >
          <Ionicons name="add" size={32} color={palette.text.inverse} />
        </Pressable>
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
  errorText: {
    marginTop: 12,
    color: palette.semantic.error,
    fontSize: 14,
  },
  loader: {
    marginTop: 32,
    alignItems: 'center',
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
    marginTop: 12,
    alignSelf: 'stretch',
    width: '100%',
  },
  list: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: palette.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: palette.text.secondary,
  },
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border.light,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.brand.primary,
  },
  labelText: {
    marginTop: 4,
    fontSize: 15,
    color: palette.text.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 8,
  },
  iconBtnPressedDelete: {
    opacity: 0.7,
    backgroundColor: palette.semantic.errorMuted,
  },
  iconBtnPressedEdit: {
    opacity: 1,
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: palette.surface.input,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  statusChipOn: {
    borderColor: palette.brand.primary,
    backgroundColor: palette.brand.primaryChipFill,
  },
  statusChipText: { color: palette.text.secondary, fontSize: 12 },
  statusChipTextOn: { color: palette.brand.primary, fontWeight: '700' },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
});
