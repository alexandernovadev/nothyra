import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { FormField } from '@/components/ui/form-field';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import { perfilSchema, type PerfilFormData } from '@/lib/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

/**
 * Perfil - Formulario para editar perfil (nombre, email)
 */
export default function PerfilScreen() {
  const { user, email } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      displayName: (user?.displayName as string) ?? '',
      email: email ?? user?.email ?? '',
    },
  });

  const onSubmit = async (_data: PerfilFormData) => {
    // TODO: actualizar perfil en Firebase (updateProfile, Firestore)
  };

  return (
    <MainLayout>
      <View style={styles.container}>
      <Btn onPress={() => router.back()} style={styles.back}>
        <ThemedText type="link">← Volver</ThemedText>
      </Btn>
      <ThemedText type="title">Perfil</ThemedText>
      <ThemedText style={styles.subtitle}>Editar información personal</ThemedText>

      <View style={styles.form}>
        <FormField<PerfilFormData>
          control={control}
          name="displayName"
          icon="person-outline"
          placeholder="Nombre"
          variant="top"
        />
        <FormField<PerfilFormData>
          control={control}
          name="email"
          icon="mail-outline"
          placeholder="Correo electrónico"
          keyboardType="email-address"
          variant="bottom"
          editable={false}
        />

        {errors.root?.message ? (
          <ThemedText style={styles.errorText}>{errors.root.message}</ThemedText>
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
