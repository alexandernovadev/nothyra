import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";


export default function LoginScreen() {
  return (
    <LinearGradient
      colors={["#a1e1e1", "#bce2d4"]}
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
          {/* <Text style={styles.text}>
            hola
          </Text> */}

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#7B8B8E"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#7B8B8E"
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
              color="#7B8B8E"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Constraseña"
              placeholderTextColor="#7B8B8E"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.inputPassword}
            />
          </View>
          <Pressable style={styles.btn}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </Pressable>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}> o </Text>
            <View style={styles.separatorLine} />
          </View>
          <Pressable style={[styles.btn, styles.btnSecondary]}>
            <Text style={styles.btnText}>Crear cuenta nueva</Text>
          </Pressable>
        </View>
      </View>
      <Image
        source={require("@/assets/images/nothyra/fondo1.png")}
        style={styles.fondo}
        resizeMode="stretch"
      />
      <Image
        source={require("@/assets/images/nothyra/nothy2.png")}
        style={[styles.layer, styles.fondo]}
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
    paddingLeft: 55,
    paddingRight: 45,
    paddingTop: 16,
  },
  logoImage: {
    width: "100%",
    height: 190,
  },
  textLogo: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    position: "relative",
    top: -32,
  },
  form: {
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
    backgroundColor: "#fbfae5",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomWidth: 2,
    borderBottomColor: "#c7c3c3",
    paddingLeft: 48,
  },
  inputPassword: {
    backgroundColor: "#fbfae5",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingLeft: 48,
  },
  btn: {
    backgroundColor: "#6d41b0",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  btnSecondary: {
    backgroundColor: "#51a018",
    marginTop: 16,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#999",
  },
  separatorText: {
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 8,
  },
  fondo: {},
  layer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "25%",
  },
});