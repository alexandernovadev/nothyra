import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { FormField } from '@/components/ui/form-field';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { perfilSchema, type PerfilFormData } from '@/lib/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

/**
 * Perfil - Formulario para editar perfil (nombre). Rol y email son solo lectura.
 */
export default function PerfilScreen() {
  const { user, email, role } = useAuth();
  const router = useRouter();
  const [saveError, setSaveError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      displayName: (user?.displayName as string) ?? '',
    },
  });

  const onSubmit = async (data: PerfilFormData) => {
    if (!user) return;
    setSaveError('');
    try {
      await updateProfile(user, { displayName: data.displayName.trim() });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        { displayName: data.displayName.trim() },
        { merge: true }
      );
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar. Intenta de nuevo.';
      setSaveError(msg);
    }
  };

  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <MainLayout>
      <View style={styles.container}>
        <Btn onPress={() => router.back()} style={styles.back}>
          <ThemedText type="link">← Volver</ThemedText>
        </Btn>
        <ThemedText type="title">Perfil</ThemedText>

        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoRow}>Rol: {roleLabel}</ThemedText>
          {email ? (
            <ThemedText style={styles.infoRow}>Correo: {email}</ThemedText>
          ) : null}
        </View>

        <View style={styles.form}>
          <FormField<PerfilFormData>
            control={control}
            name="displayName"
            icon="person-outline"
            placeholder="Nombre"
            autoCapitalize="words"
            autoComplete="name"
            variant="single"
          />

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
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  back: { marginBottom: 16 },
  subtitle: {
    marginTop: 8,
    color: palette.text.secondary,
  },
  infoBlock: {
    marginTop: 16,
    gap: 8,
  },
  infoRow: {
    fontSize: 15,
    color: palette.text.secondary,
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
  errorText: {
    color: palette.semantic.error,
    fontSize: 14,
  },
  btn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: palette.text.inverse,
    fontSize: 14,
  },
});
