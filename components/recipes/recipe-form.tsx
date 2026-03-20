import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import {
  RECIPE_CATEGORIES,
  RECIPE_CATEGORY_LABELS_ES,
  RECIPE_DIFFICULTIES,
  RECIPE_DIFFICULTY_LABELS_ES,
  RECIPE_STATUSES,
  RECIPE_STATUS_LABELS_ES,
} from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { recipeSchema, type RecipeFormData } from '@/lib/forms';
import { db } from '@/lib/firebase';
import {
  RECIPES_COLLECTION,
  recipeToFirestorePayload,
  recipeToFirestoreUpdatePayload,
} from '@/lib/recipes/firestore';
import { uploadRecipeCoverFromUri } from '@/lib/recipes/storage-image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const defaultValues: RecipeFormData = {
  title: '',
  description: '',
  imageUrl: '',
  category: 'lunch',
  prepTime: 30,
  servings: 4,
  difficulty: 'easy',
  ingredients: [{ name: '', quantity: '' }],
  steps: [''],
  tags: [],
  status: 'draft',
};

type RecipeFormProps = {
  mode: 'create' | 'edit';
  recipeId?: string;
  initialValues?: Partial<RecipeFormData>;
};

export function RecipeForm({ mode, recipeId, initialValues }: RecipeFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });
  const steps = watch('steps');
  const tags = watch('tags') ?? [];
  const imageUrl = watch('imageUrl');
  const status = watch('status');

  const pickImage = async () => {
    let ImagePicker: typeof import('expo-image-picker');
    try {
      ImagePicker = await import('expo-image-picker');
    } catch {
      Alert.alert(
        'Galería no disponible',
        'El cliente de desarrollo no incluye el módulo de imágenes. Ejecuta de nuevo: npx expo run:ios o npx expo run:android (o un build EAS) y vuelve a abrir la app.',
      );
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permiso', 'Necesitamos acceso a la galería para la foto.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        setPickedUri(res.assets[0].uri);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('ExponentImagePicker') || msg.includes('native module')) {
        Alert.alert(
          'Galería no disponible',
          'Reconstruye la app nativa (npx expo run:ios / run:android) para incluir expo-image-picker.',
        );
        return;
      }
      throw e;
    }
  };

  const clearPickedImage = () => {
    setPickedUri(null);
  };

  const submitRecipe = async (data: RecipeFormData, uid: string) => {
    const base = recipeToFirestorePayload(data, uid);

    if (mode === 'create') {
      const docRef = await addDoc(collection(db, RECIPES_COLLECTION), {
        ...base,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (pickedUri) {
        const url = await uploadRecipeCoverFromUri(docRef.id, pickedUri);
        await updateDoc(docRef, { imageUrl: url });
      }
    } else if (recipeId) {
      const updatePayload = recipeToFirestoreUpdatePayload(data);
      let finalUrl = updatePayload.imageUrl;
      if (pickedUri) {
        finalUrl = await uploadRecipeCoverFromUri(recipeId, pickedUri);
      }
      await setDoc(
        doc(db, RECIPES_COLLECTION, recipeId),
        {
          ...updatePayload,
          imageUrl: finalUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
    router.back();
  };

  const onValid = async (data: RecipeFormData) => {
    const uid = user?.uid;
    if (!uid) {
      setSaveError('Sesión no válida.');
      return;
    }
    setSaveError('');
    setSaving(true);
    try {
      await submitRecipe(data, uid);
    } catch (e) {
      console.error('[RecipeForm]', e);
      setSaveError('No se pudo guardar. Revisa conexión y permisos.');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = pickedUri ?? (imageUrl || null);

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
              Recetas
            </ThemedText>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSheet}>
              <ThemedText type="subtitle" style={styles.headline}>
                {mode === 'create' ? 'Nueva receta' : 'Editar receta'}
              </ThemedText>

          <ThemedText style={styles.label}>Título</ThemedText>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Nombre del plato"
                placeholderTextColor={palette.text.secondary}
              />
            )}
          />
          {errors.title ? (
            <ThemedText style={styles.errorSmall}>{errors.title.message}</ThemedText>
          ) : null}

          <ThemedText style={styles.label}>Descripción</ThemedText>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textarea]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Resumen corto"
                placeholderTextColor={palette.text.secondary}
                multiline
                textAlignVertical="top"
              />
            )}
          />

          <ThemedText style={styles.label}>Imagen</ThemedText>
          <View style={styles.imageRow}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.preview}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.preview, styles.previewEmpty]}>
                <ThemedText style={styles.previewHint}>Sin imagen</ThemedText>
              </View>
            )}
            <View style={styles.imageBtns}>
              <Btn style={styles.pickBtn} onPress={pickImage}>
                <ThemedText type="defaultSemiBold" style={styles.pickBtnText}>
                  Elegir foto
                </ThemedText>
              </Btn>
              {pickedUri ? (
                <Btn style={styles.clearImgBtn} onPress={clearPickedImage}>
                  <ThemedText style={styles.clearImgText}>Quitar nueva</ThemedText>
                </Btn>
              ) : null}
            </View>
          </View>

          <ThemedText style={styles.label}>Categoría</ThemedText>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipsRow}>
                {RECIPE_CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => onChange(c)}
                    style={[styles.chip, value === c && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, value === c && styles.chipTextOn]}>
                      {RECIPE_CATEGORY_LABELS_ES[c]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <View style={styles.row2}>
            <View style={styles.half}>
              <ThemedText style={styles.label}>Minutos</ThemedText>
              <Controller
                control={control}
                name="prepTime"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value === 0 ? '' : String(value)}
                    onChangeText={(t) => {
                      const d = t.replace(/\D/g, '');
                      if (d === '') {
                        onChange(1);
                        return;
                      }
                      const n = Math.min(9999, Math.max(1, parseInt(d, 10) || 1));
                      onChange(n);
                    }}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
            <View style={styles.half}>
              <ThemedText style={styles.label}>Porciones</ThemedText>
              <Controller
                control={control}
                name="servings"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value === 0 ? '' : String(value)}
                    onChangeText={(t) => {
                      const d = t.replace(/\D/g, '');
                      if (d === '') {
                        onChange(1);
                        return;
                      }
                      const n = Math.min(99, Math.max(1, parseInt(d, 10) || 1));
                      onChange(n);
                    }}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
          </View>

          <ThemedText style={styles.label}>Dificultad</ThemedText>
          <Controller
            control={control}
            name="difficulty"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipsRow}>
                {RECIPE_DIFFICULTIES.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => onChange(d)}
                    style={[styles.chip, value === d && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, value === d && styles.chipTextOn]}>
                      {RECIPE_DIFFICULTY_LABELS_ES[d]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <ThemedText style={styles.label}>Ingredientes</ThemedText>
          {fields.map((field, index) => (
            <View key={field.id} style={styles.ingredientRow}>
              <Controller
                control={control}
                name={`ingredients.${index}.name`}
                render={({ field: f }) => (
                  <TextInput
                    style={[styles.input, styles.ingName]}
                    value={f.value}
                    onChangeText={f.onChange}
                    onBlur={f.onBlur}
                    placeholder="Ingrediente"
                    placeholderTextColor={palette.text.secondary}
                  />
                )}
              />
              <Controller
                control={control}
                name={`ingredients.${index}.quantity`}
                render={({ field: f }) => (
                  <TextInput
                    style={[styles.input, styles.ingQty]}
                    value={f.value}
                    onChangeText={f.onChange}
                    onBlur={f.onBlur}
                    placeholder="Cantidad"
                    placeholderTextColor={palette.text.secondary}
                  />
                )}
              />
              {fields.length > 1 ? (
                <Pressable onPress={() => remove(index)} hitSlop={8} style={styles.removeIng}>
                  <Text style={styles.removeIngText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          <Btn
            style={styles.addLineBtn}
            onPress={() => append({ name: '', quantity: '' })}
          >
            <ThemedText type="link">+ Ingrediente</ThemedText>
          </Btn>
          {errors.ingredients?.message ? (
            <ThemedText style={styles.errorSmall}>{String(errors.ingredients.message)}</ThemedText>
          ) : null}

          <ThemedText style={styles.label}>Pasos</ThemedText>
          {steps.map((_, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.stepNum}>{index + 1}.</Text>
              <TextInput
                style={[styles.input, styles.stepInput]}
                value={steps[index]}
                onChangeText={(t) => {
                  const next = [...steps];
                  next[index] = t;
                  setValue('steps', next, { shouldDirty: true });
                }}
                placeholder={`Paso ${index + 1}`}
                placeholderTextColor={palette.text.secondary}
                multiline
                textAlignVertical="top"
              />
              {steps.length > 1 ? (
                <Pressable
                  onPress={() => {
                    const next = steps.filter((_, i) => i !== index);
                    setValue('steps', next.length ? next : [''], { shouldDirty: true });
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.removeIngText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          <Btn
            style={styles.addLineBtn}
            onPress={() => setValue('steps', [...steps, ''], { shouldDirty: true })}
          >
            <ThemedText type="link">+ Paso</ThemedText>
          </Btn>

          <TagEditor tags={tags} setTags={(t) => setValue('tags', t, { shouldDirty: true })} />

          <ThemedText style={styles.label}>Estado</ThemedText>
          <View style={styles.chipsRow}>
            {RECIPE_STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setValue('status', s, { shouldDirty: true })}
                style={[styles.chip, status === s && styles.chipOn]}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextOn]}>
                  {RECIPE_STATUS_LABELS_ES[s]}
                </Text>
              </Pressable>
            ))}
          </View>

          {saveError ? <ThemedText style={styles.errorText}>{saveError}</ThemedText> : null}

          <Btn
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSubmit(onValid)}
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
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

function TagEditor({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (t: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <View style={styles.tagBlock}>
      <ThemedText style={styles.label}>Etiquetas</ThemedText>
      <View style={styles.tagChips}>
        {tags.map((t, i) => (
          <Pressable
            key={`${t}-${i}`}
            onPress={() => setTags(tags.filter((_, j) => j !== i))}
            style={styles.tagChip}
          >
            <Text style={styles.tagChipText}>{t} ✕</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.tagAddRow}>
        <TextInput
          style={[styles.input, styles.tagInput]}
          value={draft}
          onChangeText={setDraft}
          placeholder="vegano, rápido…"
          placeholderTextColor={palette.text.secondary}
          onSubmitEditing={() => {
            const v = draft.trim().toLowerCase();
            if (v && !tags.includes(v) && tags.length < 20) {
              setTags([...tags, v]);
              setDraft('');
            }
          }}
        />
        <Btn
          style={styles.tagAddBtn}
          onPress={() => {
            const v = draft.trim().toLowerCase();
            if (v && !tags.includes(v) && tags.length < 20) {
              setTags([...tags, v]);
              setDraft('');
            }
          }}
        >
          <ThemedText type="defaultSemiBold" style={styles.tagAddBtnText}>
            Añadir
          </ThemedText>
        </Btn>
      </View>
    </View>
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
  formSheet: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: palette.surface.formSheet,
    borderWidth: 1,
    borderColor: palette.surface.panelTranslucentBorder,
  },
  scroll: { flex: 1, alignSelf: 'stretch', width: '100%' },
  scrollContent: { paddingTop: 4, paddingBottom: 28, flexGrow: 1 },
  back: { alignSelf: 'flex-start', marginBottom: 0 },
  headline: {
    marginBottom: 8,
    color: palette.text.primary,
  },
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
  textarea: { minHeight: 88, paddingTop: 12 },
  errorSmall: { color: palette.semantic.error, fontSize: 12, marginTop: 4 },
  errorText: { color: palette.semantic.error, marginTop: 8 },
  imageRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4 },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: palette.surface.input,
  },
  previewEmpty: { justifyContent: 'center', alignItems: 'center' },
  previewHint: { fontSize: 11, color: palette.text.muted },
  imageBtns: { flex: 1, gap: 8 },
  pickBtn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  pickBtnText: { color: palette.text.inverse, textAlign: 'center' },
  clearImgBtn: {
    backgroundColor: palette.surface.overlay,
    borderRadius: 12,
    paddingVertical: 8,
  },
  clearImgText: { color: palette.text.primary, textAlign: 'center', fontSize: 13 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: palette.surface.input,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  chipOn: {
    borderColor: palette.brand.primary,
    backgroundColor: palette.brand.primaryChipFill,
  },
  chipText: { fontSize: 13, color: palette.text.secondary },
  chipTextOn: { color: palette.brand.primary, fontWeight: '700' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  ingredientRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  ingName: { flex: 1.2 },
  ingQty: { flex: 0.8 },
  removeIng: { padding: 4 },
  removeIngText: { color: palette.semantic.error, fontSize: 18 },
  addLineBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'flex-start' },
  stepNum: { width: 22, marginTop: 12, fontWeight: '700', color: palette.text.secondary },
  stepInput: { flex: 1, minHeight: 48 },
  tagBlock: { marginTop: 8 },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tagChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.semantic.infoMuted,
    borderWidth: 1,
    borderColor: palette.semantic.infoBorderSoft,
  },
  tagChipText: { fontSize: 12, color: palette.semantic.info },
  tagAddRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tagInput: { flex: 1 },
  tagAddBtn: {
    backgroundColor: palette.semantic.info,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tagAddBtnText: { color: palette.text.inverse, fontSize: 13 },
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
