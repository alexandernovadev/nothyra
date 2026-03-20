import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { FormField } from '@/components/ui/form-field';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { profileSchema, type ProfileFormData } from '@/lib/forms';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Profile: edit display name. Role and email are read-only.
 */
export default function ProfileScreen() {
  const { user, email, role } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [saveError, setSaveError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: (user?.displayName as string) ?? '',
    },
  });

  const scrollFieldIntoViewAndroid = useCallback(() => {
    if (Platform.OS !== 'android') return;
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scroll);
    setTimeout(scroll, 280);
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSaveError('');
    try {
      await updateProfile(user, { displayName: data.displayName.trim() });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        { displayName: data.displayName.trim() },
        { merge: true },
      );
      router.back();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al guardar. Intenta de nuevo.';
      setSaveError(msg);
    }
  };

  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior="padding"
        enabled={Platform.OS === 'android'}
        keyboardVerticalOffset={insets.top}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Btn onPress={() => router.back()} style={styles.back}>
              <ThemedText type="link">← Volver</ThemedText>
            </Btn>
            <ThemedText type="title" style={styles.headerTitle}>
              Perfil
            </ThemedText>
            <ThemedText style={styles.headerHint}>
              El correo no se puede cambiar aquí
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
            <View style={styles.blockReadonly}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons
                  name="id-card-outline"
                  size={16}
                  color={palette.semantic.info}
                />
                <ThemedText style={styles.sectionTitleReadonly}>
                  Tu cuenta
                </ThemedText>
              </View>
              <View style={styles.readonlyRowFirst}>
                <ThemedText style={styles.readonlyLabel}>Rol</ThemedText>
                <ThemedText style={styles.readonlyValue}>{roleLabel}</ThemedText>
              </View>
              {email ? (
                <View style={styles.readonlyRowNext}>
                  <ThemedText style={styles.readonlyLabel}>Correo</ThemedText>
                  <ThemedText style={styles.readonlyValue} numberOfLines={2}>
                    {email}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.blockName}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={palette.brand.primary}
                />
                <ThemedText style={styles.sectionTitleName}>
                  Nombre visible
                </ThemedText>
              </View>
              <ThemedText style={styles.fieldHint}>
                Así aparecerá en la app y en “Más”
              </ThemedText>
              <FormField<ProfileFormData>
                control={control}
                name="displayName"
                icon="create-outline"
                placeholder="Tu nombre o apodo"
                autoCapitalize="words"
                autoComplete="name"
                variant="single"
                onFocus={scrollFieldIntoViewAndroid}
              />
            </View>

            {(errors.root?.message || saveError) ? (
              <ThemedText style={styles.errorText}>
                {errors.root?.message ?? saveError}
              </ThemedText>
            ) : null}

            <Btn
              style={[styles.btn, !isDirty && styles.btnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty}
            >
              <ThemedText type="defaultSemiBold" style={styles.btnText}>
                Guardar cambios
              </ThemedText>
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
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    paddingBottom: 10,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.light,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerTitle: {
    marginTop: 2,
  },
  headerHint: {
    marginTop: 6,
    fontSize: 13,
    color: palette.text.muted,
  },
  scroll: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 28,
    flexGrow: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  blockReadonly: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: palette.semantic.infoMuted,
    borderWidth: 1,
    borderColor: palette.semantic.infoBorderSoft,
  },
  sectionTitleReadonly: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.semantic.info,
  },
  readonlyRowFirst: {
    marginTop: 4,
  },
  readonlyRowNext: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.semantic.infoBorderSoft,
  },
  readonlyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  readonlyValue: {
    fontSize: 15,
    color: palette.text.primary,
    fontWeight: '500',
  },
  blockName: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: palette.brand.primaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.primaryBorderSoft,
  },
  sectionTitleName: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.brand.primary,
  },
  fieldHint: {
    fontSize: 13,
    color: palette.text.secondary,
    marginBottom: 10,
    marginTop: -2,
  },
  errorText: {
    color: palette.semantic.error,
    fontSize: 14,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: palette.text.inverse,
    fontSize: 15,
  },
});
