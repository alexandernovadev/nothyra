import { palette } from "@/constants/palette";
import { getAppVersion } from "@/lib/app-version";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Pie con la versión de la app (desde Expo config), alineado al fondo del scroll.
 */
export function AuthVersionFooter() {
  const insets = useSafeAreaInsets();
  const version = getAppVersion();
  if (!version) return null;

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.chip}>
        <Text style={styles.text}>Versión {version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: "auto",
    paddingTop: 20,
    alignItems: "flex-end",
    width: "100%",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: palette.surface.panelTranslucent,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  text: {
    fontSize: 12,
    color: palette.text.secondary,
    fontWeight: "600",
  },
});
