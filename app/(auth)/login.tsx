import { Btn } from "@/components/ui/btn";
import { FormField } from "@/components/ui/form-field";
import { mainGradient, palette } from "@/constants/palette";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";

import { auth } from "@/lib/firebase";
import { loginSchema, type LoginFormData } from "@/lib/forms";

const defaultValues: LoginFormData = {
  email: "",
  password: "",
};

export default function LoginScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const handleGoogleSignIn = async () => {
    if (Platform.OS === "web") return;
    setLoading(true);
    setServerError("");

    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const result = await GoogleSignin.signIn();
      if (result.type !== "success" || !result.data) {
        if (result.type === "cancelled") return;
        throw new Error("No se pudo iniciar sesión con Google.");
      }

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error("No se obtuvo el token de Google. Revisa la configuración.");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión con Google.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setServerError("");

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión.";
      if (
        message.includes("auth/invalid-credential") ||
        message.includes("auth/wrong-password")
      ) {
        setError("root", { message: "Email o contraseña incorrectos." });
      } else if (message.includes("auth/user-not-found")) {
        setError("root", { message: "No existe una cuenta con este correo." });
      } else if (message.includes("auth/invalid-email")) {
        setError("email", { message: "Correo electrónico no válido." });
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayError = errors.root?.message|| serverError || errors.email?.message || errors.password?.message;

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
            <FormField<LoginFormData>
              control={control}
              name="email"
              icon="mail-outline"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              variant="top"
              editable={!loading}
            />
            <FormField<LoginFormData>
              control={control}
              name="password"
              icon="lock-closed-outline"
              placeholder="Contraseña"
              secureTextEntry
              showTogglePassword
              autoComplete="password"
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
              <Text style={styles.btnText}>Iniciar Sesión</Text>
            )}
          </Btn>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}> o </Text>
            <View style={styles.separatorLine} />
          </View>
          <Btn
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.push("/(auth)/registro")}
            disabled={loading}
          >
            <Text style={styles.btnText}>Crear cuenta nueva</Text>
          </Btn>
          {Platform.OS !== "web" && (
            <Btn
              style={styles.btnGoogle}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Image
                source={require("@/assets/images/nothyra/google.png")}
                style={styles.googleLogo}
                resizeMode="contain"
              />
            </Btn>
          )}
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
  btnGoogle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surface.input,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  googleLogo: { width: 24, height: 24 },
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
