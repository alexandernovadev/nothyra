import { palette, authGradient } from "@/constants/palette";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { auth } from "@/lib/firebase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión.";
      if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
        setError("Email o contraseña incorrectos.");
      } else if (message.includes("auth/user-not-found")) {
        setError("No existe una cuenta con este correo.");
      } else if (message.includes("auth/invalid-email")) {
        setError("Correo electrónico no válido.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={authGradient}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Image
          source={require("@/assets/images/nothyra/NothyraLogo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
        <Text style={styles.textLogo}>
          Tu espacio saludable y divertido
        </Text>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.inputsGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={palette.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor={palette.text.secondary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                style={styles.inputEmail}
                editable={!loading}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={palette.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={palette.text.secondary}
                autoCapitalize="none"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                style={styles.inputPassword}
                editable={!loading}
              />
            </View>
          </View>
          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={palette.text.inverse} size="small" />
            ) : (
              <Text style={styles.btnText}>Iniciar Sesión</Text>
            )}
          </Pressable>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}> o </Text>
            <View style={styles.separatorLine} />
          </View>
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.push("/(auth)/registro")}
            disabled={loading}
          >
            <Text style={styles.btnText}>Crear cuenta nueva</Text>
          </Pressable>
          <Pressable style={styles.btnGoogle} disabled={loading}>
            <Image
              source={require("@/assets/images/nothyra/google.png")}
              style={styles.googleLogo}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <Image
        source={require("@/assets/images/nothyra/nothyhd.png")}
        style={[styles.layer]}
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
  container: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    paddingHorizontal: 50,
    paddingTop: 32,
    zIndex: 10,
  },
  logoImage: {
    width: "100%",
    height: 190,
  },
  textLogo: {
    color: palette.text.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    position: "relative",
    top: -24,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  errorText: {
    color: palette.semantic.error,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: palette.semantic.errorMuted,
    padding: 10,
    borderRadius: 8,
  },
  inputsGroup: {
    width: "100%",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },
  inputEmail: {
    backgroundColor: palette.surface.input,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomWidth: 2,
    borderBottomColor: palette.border.light,
    paddingLeft: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.text.primary,
  },
  inputPassword: {
    backgroundColor: palette.surface.input,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingLeft: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.text.primary,
  },
  btn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: palette.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  btnSecondary: {
    backgroundColor: palette.brand.secondary,
  },
  btnGoogle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surface.input,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  googleLogo: {
    width: 24,
    height: 24,
  },
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
    height: "25%",
  },
});
