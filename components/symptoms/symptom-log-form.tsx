import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { FormField } from '@/components/ui/form-field';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import {
  ENERGY_LABELS_ES,
  ENERGY_LEVEL_ICONS,
  ENERGY_LEVELS,
  formatLongDateSpanish,
  getTodayDateKey,
  MOOD_LABELS_ES,
  MOOD_LEVEL_ICONS,
  MOOD_LEVELS,
  SYMPTOM_IDS,
  SYMPTOM_LABELS_ES,
  type EnergyLevel,
  type MoodLevel,
  type SymptomId,
} from '@/constants/symptom-log';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { symptomLogSchema, type SymptomLogFormData } from '@/lib/forms';
import { SYMPTOM_LOGS_COLLECTION } from '@/lib/symptom-log/firestore';
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
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SymptomLogFormProps = {
  /** Firestore document id when editing an existing log */
  entryId?: string;
  /** Calendar day (YYYY-MM-DD) for new logs only */
  initialDateKey: string;
};

export function SymptomLogForm({ entryId, initialDateKey }: SymptomLogFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isEditMode = Boolean(entryId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SymptomLogFormData>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      dateKey: initialDateKey,
      energyLevel: 'normal',
      mood: 'normal',
      symptoms: [],
      notes: '',
    },
  });

  const energyLevel = watch('energyLevel');
  const mood = watch('mood');
  const symptoms = watch('symptoms') ?? [];
  const dateKey = watch('dateKey');

  const isToday = dateKey === getTodayDateKey();

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoadError('');
    if (!entryId) {
      reset({
        dateKey: initialDateKey,
        energyLevel: 'normal',
        mood: 'normal',
        symptoms: [],
        notes: '',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, SYMPTOM_LOGS_COLLECTION, entryId));
      if (!snap.exists()) {
        setLoadError('No se encontró el registro.');
        reset({
          dateKey: initialDateKey,
          energyLevel: 'normal',
          mood: 'normal',
          symptoms: [],
          notes: '',
        });
      } else {
        const d = snap.data() as Partial<SymptomLogFormData> & { userId?: string };
        if (d.userId !== user.uid) {
          setLoadError('No tienes permiso para ver este registro.');
          reset({
            dateKey: initialDateKey,
            energyLevel: 'normal',
            mood: 'normal',
            symptoms: [],
            notes: '',
          });
        } else {
          reset({
            dateKey: String(d.dateKey ?? initialDateKey),
            energyLevel: (d.energyLevel as EnergyLevel) ?? 'normal',
            mood: (d.mood as MoodLevel) ?? 'normal',
            symptoms: (d.symptoms as SymptomId[]) ?? [],
            notes: typeof d.notes === 'string' ? d.notes : '',
          });
        }
      }
    } catch (e) {
      console.error('[SymptomLogForm] load:', e);
      setLoadError('No se pudo cargar el registro.');
    } finally {
      setLoading(false);
    }
  }, [user, entryId, initialDateKey, reset]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const scrollNotesIntoViewAndroid = useCallback(() => {
    if (Platform.OS !== 'android') return;
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scroll);
    setTimeout(scroll, 280);
  }, []);

  const toggleSymptom = (id: SymptomId) => {
    const next = symptoms.includes(id)
      ? symptoms.filter((s) => s !== id)
      : [...symptoms, id];
    setValue('symptoms', next, { shouldDirty: true });
  };

  const onSubmit = async (data: SymptomLogFormData) => {
    if (!user) return;
    setSaveError('');
    setSaving(true);
    try {
      if (entryId) {
        await setDoc(
          doc(db, SYMPTOM_LOGS_COLLECTION, entryId),
          {
            userId: user.uid,
            dateKey: data.dateKey,
            energyLevel: data.energyLevel,
            mood: data.mood,
            symptoms: data.symptoms,
            notes: data.notes,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await addDoc(collection(db, SYMPTOM_LOGS_COLLECTION), {
          userId: user.uid,
          dateKey: data.dateKey,
          energyLevel: data.energyLevel,
          mood: data.mood,
          symptoms: data.symptoms,
          notes: data.notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      router.back();
    } catch (e) {
      console.error('[SymptomLogForm] save:', e);
      setSaveError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

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
              Registro de síntomas
            </ThemedText>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            showsVerticalScrollIndicator={false}
          >
          <ThemedText type="subtitle" style={styles.headline}>
            {isEditMode
              ? 'Editar registro'
              : isToday
                ? '¿Cómo te sientes hoy?'
                : 'Nuevo registro'}
          </ThemedText>

          <View style={styles.dateSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={palette.brand.secondary}
              />
              <ThemedText style={styles.dateSectionLabel}>Fecha</ThemedText>
            </View>
            <ThemedText style={styles.dateValue}>
              {formatLongDateSpanish(dateKey)}
            </ThemedText>
          </View>

          {loadError ? (
            <ThemedText style={styles.errorText}>{loadError}</ThemedText>
          ) : null}

          <View style={styles.blockEnergy}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="flash-outline"
                size={16}
                color={palette.brand.primary}
              />
              <ThemedText style={styles.sectionTitleEnergy}>
                Nivel de energía
              </ThemedText>
            </View>
            <View style={styles.chipsRow}>
              {ENERGY_LEVELS.map((level) => {
                const selected = energyLevel === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() =>
                      setValue('energyLevel', level, { shouldDirty: true })
                    }
                    style={[
                      styles.chip,
                      selected && styles.chipSelectedEnergy,
                    ]}
                  >
                    <View style={styles.chipInner}>
                      <Ionicons
                        name={
                          ENERGY_LEVEL_ICONS[level] as ComponentProps<
                            typeof Ionicons
                          >['name']
                        }
                        size={14}
                        color={
                          selected
                            ? palette.brand.primary
                            : palette.text.secondary
                        }
                      />
                      <ThemedText
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelectedEnergy,
                        ]}
                      >
                        {ENERGY_LABELS_ES[level]}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {errors.energyLevel ? (
            <ThemedText style={styles.errorText}>
              {errors.energyLevel.message}
            </ThemedText>
          ) : null}

          <View style={styles.blockMood}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="happy-outline"
                size={16}
                color={palette.brand.secondary}
              />
              <ThemedText style={styles.sectionTitleMood}>
                Estado de ánimo
              </ThemedText>
            </View>
            <View style={styles.chipsRow}>
              {MOOD_LEVELS.map((m) => {
                const selected = mood === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setValue('mood', m, { shouldDirty: true })}
                    style={[styles.chip, selected && styles.chipSelectedMood]}
                  >
                    <View style={styles.chipInner}>
                      <Ionicons
                        name={
                          MOOD_LEVEL_ICONS[m] as ComponentProps<
                            typeof Ionicons
                          >['name']
                        }
                        size={14}
                        color={
                          selected
                            ? palette.brand.secondary
                            : palette.text.secondary
                        }
                      />
                      <ThemedText
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelectedMood,
                        ]}
                      >
                        {MOOD_LABELS_ES[m]}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {errors.mood ? (
            <ThemedText style={styles.errorText}>{errors.mood.message}</ThemedText>
          ) : null}

          <View style={styles.blockSymptoms}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="list-outline"
                size={16}
                color={palette.text.secondary}
              />
              <ThemedText style={styles.sectionTitleSymptoms}>
                Síntomas en este registro
              </ThemedText>
            </View>
            <View style={styles.checklist}>
              {SYMPTOM_IDS.map((id) => {
                const checked = symptoms.includes(id);
                return (
                  <Pressable
                    key={id}
                    onPress={() => toggleSymptom(id)}
                    style={styles.checkRow}
                  >
                    <View
                      style={[styles.checkbox, checked && styles.checkboxOn]}
                    />
                    <ThemedText style={styles.checkLabel}>
                      {SYMPTOM_LABELS_ES[id]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.blockNotes}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitleNotes}>
                Notas adicionales
              </ThemedText>
            </View>
            <FormField<SymptomLogFormData>
              control={control}
              name="notes"
              icon="chatbox-ellipses-outline"
              placeholder="¿Algo más que quieras registrar?"
              multiline
              variant="single"
              onFocus={scrollNotesIntoViewAndroid}
              style={{ minHeight: 96 }}
            />
          </View>
          {errors.notes ? (
            <ThemedText style={styles.errorText}>{errors.notes.message}</ThemedText>
          ) : null}

          {saveError ? (
            <ThemedText style={styles.errorText}>{saveError}</ThemedText>
          ) : null}

          <Btn
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={palette.text.inverse} size="small" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.saveBtnText}>
                {isEditMode ? 'Guardar cambios' : 'Guardar'}
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
  keyboardRoot: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  root: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    paddingBottom: 8,
    marginBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.light,
  },
  headerTitle: {
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 28,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  headline: {
    marginBottom: 8,
    color: palette.text.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateSection: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: palette.brand.secondaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.secondaryBorderSoft,
  },
  dateSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text.primary,
    textTransform: 'capitalize',
  },
  blockEnergy: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.brand.primaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.primaryBorderSoft,
  },
  blockMood: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.brand.secondaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.secondaryBorderSoft,
  },
  blockSymptoms: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.surface.panelTranslucent,
    borderWidth: 1,
    borderColor: palette.surface.panelTranslucentBorder,
  },
  blockNotes: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.semantic.infoMuted,
    borderWidth: 1,
    borderColor: palette.semantic.infoBorderSoft,
  },
  sectionTitleEnergy: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.brand.primary,
  },
  sectionTitleMood: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.brand.secondary,
  },
  sectionTitleSymptoms: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text.primary,
  },
  sectionTitleNotes: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.semantic.info,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    borderColor: palette.border.light,
  },
  chipSelectedEnergy: {
    borderColor: palette.brand.primary,
    backgroundColor: palette.brand.primaryChipFill,
  },
  chipSelectedMood: {
    borderColor: palette.brand.secondary,
    backgroundColor: palette.brand.secondaryMuted,
  },
  chipText: {
    fontSize: 13,
    color: palette.text.secondary,
  },
  chipTextSelectedEnergy: {
    color: palette.brand.primary,
    fontWeight: '700',
  },
  chipTextSelectedMood: {
    color: palette.brand.secondary,
    fontWeight: '700',
  },
  checklist: {
    gap: 0,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.border.medium,
    backgroundColor: palette.surface.checkboxIdle,
  },
  checkboxOn: {
    backgroundColor: palette.brand.secondary,
    borderColor: palette.brand.secondary,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
  },
  errorText: {
    color: palette.semantic.error,
    fontSize: 13,
    marginTop: 6,
  },
  saveBtn: {
    marginTop: 14,
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: palette.text.inverse,
  },
});
