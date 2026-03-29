import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { reminderSchema, type ReminderFormData } from '@/lib/forms';
import { db } from '@/lib/firebase';
import { REMINDERS_COLLECTION } from '@/lib/reminders/firestore';
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from '@/lib/reminders/notifications';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReminderFormProps = {
  reminderId?: string;
};

const defaultValues: ReminderFormData = {
  label: '',
  hour: 8,
  minute: 0,
  enabled: true,
};

export function ReminderForm({ reminderId }: ReminderFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(Boolean(reminderId));
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);
  const isEditMode = Boolean(reminderId);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues,
  });

  const enabled = watch('enabled');

  const loadData = useCallback(async () => {
    if (!isEditMode || !reminderId) {
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const snap = await getDoc(doc(db, REMINDERS_COLLECTION, reminderId));
      if (!snap.exists()) {
        setLoadError('No se encontró el recordatorio.');
        reset(defaultValues);
        return;
      }
      const data = snap.data() as {
        userId?: string;
        label?: string;
        hour?: number;
        minute?: number;
        enabled?: boolean;
        notificationId?: string | null;
      };
      if (data.userId !== user.uid) {
        setLoadError('No tienes permiso para editar este recordatorio.');
        reset(defaultValues);
        return;
      }
      reset({
        label: String(data.label ?? ''),
        hour:
          typeof data.hour === 'number' && Number.isFinite(data.hour)
            ? Math.max(0, Math.min(23, Math.trunc(data.hour)))
            : 8,
        minute:
          typeof data.minute === 'number' && Number.isFinite(data.minute)
            ? Math.max(0, Math.min(59, Math.trunc(data.minute)))
            : 0,
        enabled: Boolean(data.enabled),
      });
      setCurrentNotificationId(typeof data.notificationId === 'string' ? data.notificationId : null);
    } catch (e) {
      console.error('[ReminderForm] load:', e);
      setLoadError('No se pudo cargar el recordatorio.');
    } finally {
      setLoading(false);
    }
  }, [isEditMode, reminderId, reset, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onSubmit = async (data: ReminderFormData) => {
    const uid = user?.uid;
    if (!uid) return;
    setSaveError('');
    setSaving(true);
    try {
      if (isEditMode && reminderId) {
        if (data.enabled) {
          let nextNotificationId: string | null = null;
          try {
            nextNotificationId = await scheduleReminderNotification({
              label: data.label.trim(),
              hour: data.hour,
              minute: data.minute,
            });
            await setDoc(
              doc(db, REMINDERS_COLLECTION, reminderId),
              {
                userId: uid,
                label: data.label.trim(),
                hour: data.hour,
                minute: data.minute,
                enabled: true,
                notificationId: nextNotificationId,
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
            if (currentNotificationId && currentNotificationId !== nextNotificationId) {
              await cancelReminderNotification(currentNotificationId);
            }
            setCurrentNotificationId(nextNotificationId);
          } catch (error) {
            if (nextNotificationId) {
              await cancelReminderNotification(nextNotificationId);
            }
            throw error;
          }
        } else {
          await setDoc(
            doc(db, REMINDERS_COLLECTION, reminderId),
            {
              userId: uid,
              label: data.label.trim(),
              hour: data.hour,
              minute: data.minute,
              enabled: false,
              notificationId: null,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
          await cancelReminderNotification(currentNotificationId);
          setCurrentNotificationId(null);
        }
      } else {
        let notificationId: string | null = null;
        try {
          if (data.enabled) {
            notificationId = await scheduleReminderNotification({
              label: data.label.trim(),
              hour: data.hour,
              minute: data.minute,
            });
          }
          await addDoc(collection(db, REMINDERS_COLLECTION), {
            userId: uid,
            label: data.label.trim(),
            hour: data.hour,
            minute: data.minute,
            enabled: data.enabled,
            notificationId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          if (notificationId) {
            await cancelReminderNotification(notificationId);
          }
          throw error;
        }
      }
      router.back();
    } catch (e) {
      console.error('[ReminderForm] save:', e);
      setSaveError(
        e instanceof Error && e.message.includes('permiso')
          ? 'Activa permisos de notificaciones para usar recordatorios activos.'
          : 'No se pudo guardar. Intenta de nuevo.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.brand.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior="padding"
        enabled={Platform.OS === 'android'}
        keyboardVerticalOffset={insets.top}
      >
        <View style={styles.root}>
          <View style={styles.header}>
            <Btn onPress={() => router.back()} style={styles.back}>
              <ThemedText type="link">← Volver</ThemedText>
            </Btn>
            <ThemedText type="title" style={styles.headerTitle}>
              Recordatorios
            </ThemedText>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="subtitle" style={styles.headline}>
              {isEditMode ? 'Editar recordatorio' : 'Nuevo recordatorio'}
            </ThemedText>

            {loadError ? <ThemedText style={styles.errorText}>{loadError}</ThemedText> : null}

            <ThemedText style={styles.label}>Etiqueta</ThemedText>
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ej. Levotiroxina"
                  placeholderTextColor={palette.text.secondary}
                />
              )}
            />
            {errors.label ? <ThemedText style={styles.errorSmall}>{errors.label.message}</ThemedText> : null}

            <View style={styles.row2}>
              <View style={styles.half}>
                <ThemedText style={styles.label}>Hora (0-23)</ThemedText>
                <Controller
                  control={control}
                  name="hour"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={String(value)}
                      onChangeText={(text) => {
                        const d = text.replace(/\D/g, '');
                        if (!d) return onChange(0);
                        onChange(Math.max(0, Math.min(23, parseInt(d, 10) || 0)));
                      }}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      placeholder="8"
                      placeholderTextColor={palette.text.secondary}
                    />
                  )}
                />
              </View>
              <View style={styles.half}>
                <ThemedText style={styles.label}>Minuto (0-59)</ThemedText>
                <Controller
                  control={control}
                  name="minute"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={String(value)}
                      onChangeText={(text) => {
                        const d = text.replace(/\D/g, '');
                        if (!d) return onChange(0);
                        onChange(Math.max(0, Math.min(59, parseInt(d, 10) || 0)));
                      }}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={palette.text.secondary}
                    />
                  )}
                />
              </View>
            </View>
            <ThemedText style={styles.timeHint}>
              Este recordatorio usa formato de 24 horas (ejemplo: 13:30 = 1:30 PM).
            </ThemedText>

            <ThemedText style={styles.label}>Estado</ThemedText>
            <Controller
              control={control}
              name="enabled"
              render={({ field: { onChange } }) => (
                <Pressable
                  onPress={() => onChange(!enabled)}
                  style={[styles.statusChip, enabled && styles.statusChipOn]}
                >
                  <ThemedText style={[styles.statusChipText, enabled && styles.statusChipTextOn]}>
                    {enabled ? 'Activo' : 'Desactivado'}
                  </ThemedText>
                </Pressable>
              )}
            />

            {saveError ? <ThemedText style={styles.errorText}>{saveError}</ThemedText> : null}

            <Btn
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={palette.text.inverse} />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.saveBtnText}>
                  Guardar
                </ThemedText>
              )}
            </Btn>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1, width: '100%', alignSelf: 'stretch' },
  root: { flex: 1, width: '100%', alignSelf: 'stretch' },
  header: {
    paddingBottom: 8,
    marginBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.light,
  },
  headerTitle: { marginTop: 2 },
  scroll: { flex: 1, alignSelf: 'stretch', width: '100%' },
  scrollContent: { paddingTop: 4, paddingBottom: 28, flexGrow: 1 },
  back: { alignSelf: 'flex-start', marginBottom: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headline: { marginBottom: 8, color: palette.text.primary },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
    color: palette.text.secondary,
  },
  input: {
    backgroundColor: palette.surface.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text.primary,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  timeHint: {
    marginTop: 8,
    fontSize: 12,
    color: palette.text.muted,
  },
  statusChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: palette.surface.input,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  statusChipOn: {
    borderColor: palette.brand.primary,
    backgroundColor: palette.brand.primaryChipFill,
  },
  statusChipText: { color: palette.text.secondary, fontSize: 13 },
  statusChipTextOn: { color: palette.brand.primary, fontWeight: '700' },
  errorSmall: { color: palette.semantic.error, fontSize: 12, marginTop: 4 },
  errorText: { color: palette.semantic.error, marginTop: 8 },
  saveBtn: {
    marginTop: 24,
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: palette.text.inverse },
});
