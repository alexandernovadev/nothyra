import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { RECIPE_STATUSES, RECIPE_STATUS_LABELS_ES } from '@/constants/recipes';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { blogPostSchema, type BlogPostFormData } from '@/lib/forms';
import { db } from '@/lib/firebase';
import {
  BLOG_POSTS_COLLECTION,
  blogPostToFirestorePayload,
  blogPostToFirestoreUpdatePayload,
} from '@/lib/blog/firestore';
import { uploadBlogCoverFromUri } from '@/lib/blog/storage-cover';
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
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const defaultValues: BlogPostFormData = {
  title: '',
  excerpt: '',
  coverImageUrl: '',
  author: '',
  content: [''],
  tags: [],
  status: 'draft',
};

type BlogPostFormProps = {
  mode: 'create' | 'edit';
  postId?: string;
  initialValues?: Partial<BlogPostFormData>;
};

export function BlogPostForm({ mode, postId, initialValues }: BlogPostFormProps) {
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
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const content = watch('content');
  const tags = watch('tags') ?? [];
  const coverImageUrl = watch('coverImageUrl');
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
        Alert.alert(
          'Permiso de fotos',
          'Activa el acceso a la galería en los ajustes del sistema para elegir una imagen.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir ajustes',
              onPress: () => {
                Linking.openSettings().catch(() => {});
              },
            },
          ],
        );
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

  const submitPost = async (data: BlogPostFormData, uid: string) => {
    const base = blogPostToFirestorePayload(data, uid);

    if (mode === 'create') {
      const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), {
        ...base,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (pickedUri) {
        const url = await uploadBlogCoverFromUri(docRef.id, pickedUri);
        await updateDoc(docRef, { coverImageUrl: url });
      }
    } else if (postId) {
      const updatePayload = blogPostToFirestoreUpdatePayload(data);
      let finalUrl = updatePayload.coverImageUrl;
      if (pickedUri) {
        finalUrl = await uploadBlogCoverFromUri(postId, pickedUri);
      }
      await setDoc(
        doc(db, BLOG_POSTS_COLLECTION, postId),
        {
          ...updatePayload,
          coverImageUrl: finalUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
    router.back();
  };

  const onValid = async (data: BlogPostFormData) => {
    const uid = user?.uid;
    if (!uid) {
      setSaveError('Sesión no válida.');
      return;
    }
    setSaveError('');
    setSaving(true);
    try {
      await submitPost(data, uid);
    } catch (e) {
      console.error('[BlogPostForm]', e);
      setSaveError('No se pudo guardar. Revisa conexión y permisos.');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = pickedUri ?? (coverImageUrl || null);

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
              Blog
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
                {mode === 'create' ? 'Nuevo artículo' : 'Editar artículo'}
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
                    placeholder="Título del artículo"
                    placeholderTextColor={palette.text.secondary}
                  />
                )}
              />
              {errors.title ? (
                <ThemedText style={styles.errorSmall}>{errors.title.message}</ThemedText>
              ) : null}

              <ThemedText style={styles.label}>Resumen (extracto)</ThemedText>
              <Controller
                control={control}
                name="excerpt"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Texto corto para la lista y tarjetas"
                    placeholderTextColor={palette.text.secondary}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.excerpt ? (
                <ThemedText style={styles.errorSmall}>{errors.excerpt.message}</ThemedText>
              ) : null}

              <ThemedText style={styles.label}>Autor</ThemedText>
              <Controller
                control={control}
                name="author"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Nombre visible"
                    placeholderTextColor={palette.text.secondary}
                  />
                )}
              />
              {errors.author ? (
                <ThemedText style={styles.errorSmall}>{errors.author.message}</ThemedText>
              ) : null}

              <ThemedText style={styles.label}>Imagen de portada</ThemedText>
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

              <ThemedText style={styles.label}>Contenido (párrafos)</ThemedText>
              {content.map((_, index) => (
                <View key={index} style={styles.stepRow}>
                  <Text style={styles.stepNum}>{index + 1}.</Text>
                  <TextInput
                    style={[styles.input, styles.stepInput]}
                    value={content[index]}
                    onChangeText={(t) => {
                      const next = [...content];
                      next[index] = t;
                      setValue('content', next, { shouldDirty: true });
                    }}
                    placeholder={`Párrafo ${index + 1}`}
                    placeholderTextColor={palette.text.secondary}
                    multiline
                    textAlignVertical="top"
                  />
                  {content.length > 1 ? (
                    <Pressable
                      onPress={() => {
                        const next = content.filter((_, i) => i !== index);
                        setValue('content', next.length ? next : [''], { shouldDirty: true });
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
                onPress={() => setValue('content', [...content, ''], { shouldDirty: true })}
              >
                <ThemedText type="link">+ Párrafo</ThemedText>
              </Btn>
              {errors.content?.message ? (
                <ThemedText style={styles.errorSmall}>{String(errors.content.message)}</ThemedText>
              ) : null}

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
          placeholder="salud, nutrición…"
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
  addLineBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'flex-start' },
  stepNum: { width: 22, marginTop: 12, fontWeight: '700', color: palette.text.secondary },
  stepInput: { flex: 1, minHeight: 48 },
  removeIngText: { color: palette.semantic.error, fontSize: 18 },
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
