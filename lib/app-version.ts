import Constants from "expo-constants";

/**
 * Versión de la app desde la config de Expo (app.json / app.config), sin hardcodear.
 */
export function getAppVersion(): string {
  const v =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    undefined;
  return typeof v === "string" && v.length > 0 ? v : "";
}
