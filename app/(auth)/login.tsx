import { palette, authGradient } from "@/constants/palette";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  
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
                style={styles.inputEmail}
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
                placeholder="Constraseña"
                placeholderTextColor={palette.text.secondary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.inputPassword}
              />
            </View>
          </View>
          <Pressable style={styles.btn}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </Pressable>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}> o </Text>
            <View style={styles.separatorLine} />
          </View>
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.push("/registro")}
          >
            <Text style={styles.btnText}>Crear cuenta nueva</Text>
          </Pressable>
          <Pressable style={styles.btnGoogle}>
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
  },
  inputPassword: {
    backgroundColor: palette.surface.input,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingLeft: 48,
  },
  btn: {
    backgroundColor: palette.brand.primary,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
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
