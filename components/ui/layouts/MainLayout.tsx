import { mainGradient } from "@/constants/palette";
import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <LinearGradient colors={mainGradient} style={styles.container}>
  
      <Image
        source={require("@/assets/images/nothyra/arbustosolo.png")}
        style={styles.layer}
        resizeMode="stretch"
      />
      <Image
        source={require("@/assets/images/nothyra/hdbordeshojas.png")}
        style={styles.fondo2}
        resizeMode="stretch"
      />
          <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:{
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
    paddingTop: 30,
    paddingLeft: 48,
    paddingRight: 48,
    // backgroundColor:'red',
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
    height: "15%",
  },
});