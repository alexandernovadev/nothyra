import { Btn } from "@/components/ui/btn";
import { FormField } from "@/components/ui/form-field";
import { mainGradient, palette } from "@/constants/palette";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";

import { auth, db } from "@/lib/firebase";
import { signUpSchema, type SignUpFormData } from "@/lib/forms";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const defaultValues: SignUpFormData = {
  name: "",
  email: "",
  password: "",
};

export default function SignUpScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, []);

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setServerError("");

    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

      if (cred.user && data.name) {
        await updateProfile(cred.user, { displayName: data.name });
      }

      if (cred.user) {
        const userRef = doc(db, "users", cred.user.uid);
        await setDoc(
          userRef,
          {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: data.name || cred.user.displayName || "",
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      router.replace("/(tabs)");
    } catch (err: unknown) {
      console.error("[SignUp] Error:", err);
      const message = err instanceof Error ? err.message : "Error al crear cuenta.";
      if (message.includes("auth/email-already-in-use")) {
        setError("email", { message: "Ya existe una cuenta con este correo." });
      } else if (message.includes("auth/invalid-email")) {
        setError("email", { message: "Correo electrónico no válido." });
      } else if (message.includes("auth/weak-password")) {
        setError("password", { message: "La contraseña debe tener al menos 6 caracteres." });
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayError =
    errors.root?.message ||
    serverError ||
    errors.email?.message ||
    errors.password?.message;

  return (
    <LinearGradient colors={mainGradient} style={styles.container}>
      <View style={styles.textContainer}>
        <Image
          source={require("@/assets/images/nothyra/NothyraLogo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
        <Text style={styles.textLogo}>Tu espacio saludable y divertido</Text>

        <View style={styles.form}>
          {displayError ? (
            <Text style={styles.errorText}>{displayError}</Text>
          ) : null}
          <View style={styles.inputsGroup}>
            <FormField<SignUpFormData>
              control={control}
              name="name"
              icon="person-outline"
              placeholder="Nombre"
              autoCapitalize="words"
              autoComplete="name"
              variant="top"
              editable={!loading}
            />
            <FormField<SignUpFormData>
              control={control}
              name="email"
              icon="mail-outline"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              variant="middle"
              editable={!loading}
            />
            <FormField<SignUpFormData>
              control={control}
              name="password"
              icon="lock-closed-outline"
              placeholder="Contraseña"
              secureTextEntry
              showTogglePassword
              autoComplete="new-password"
              variant="bottom"
              editable={!loading}
            />
          </View>
          <Btn
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={palette.text.inverse} size="small" />
            ) : (
              <Text style={styles.btnText}>Crear cuenta</Text>
            )}
          </Btn>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}> ¿Ya tienes cuenta? </Text>
            <View style={styles.separatorLine} />
          </View>
          <Btn
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.push("/(auth)/login")}
            disabled={loading}
          >
            <Text style={styles.btnText}>Iniciar sesión</Text>
          </Btn>
        </View>
      </View>

      <Image
        source={require("@/assets/images/nothyra/nothyhd.png")}
        style={styles.layer}
        resizeMode="stretch"
      />
      <Image
        source={require("@/assets/images/nothyra/hphd.png")}
        style={styles.fondo2}
        resizeMode="stretch"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  textContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    paddingHorizontal: 50,
    paddingTop: 32,
    zIndex: 10,
  },
  logoImage: { width: "100%", height: 190 },
  textLogo: {
    color: palette.text.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    position: "relative",
    top: -24,
  },
  form: { width: "100%", gap: 16 },
  errorText: {
    color: palette.semantic.error,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: palette.semantic.errorMuted,
    padding: 10,
    borderRadius: 8,
  },
  inputsGroup: { width: "100%" },
  btn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: {
    color: palette.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  btnSecondary: { backgroundColor: palette.brand.secondary },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border.medium,
  },
  separatorText: {
    color: palette.text.muted,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  fondo2: {
    position: "absolute",
    width: "100%",
    height: "90%",
    top: 0,
    left: 0,
    bottom: 0,
  },
  layer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "22%",
  },
});
