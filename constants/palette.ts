/**
 * Nothyra color palette.
 * Orden y jerarquía: usar siempre tokens, nunca colores quemados.
 *
 * 1. background  - Fondo principal de la app
 * 2. brand       - Identidad Nothyra
 * 3. surface     - Fondos de superficies (inputs, overlays)
 * 4. text        - Texto
 * 5. border      - Bordes
 * 6. semantic    - Estados (éxito, error, advertencia)
 */

export const palette = {
  /** Fondo principal de pantallas */
  background: "#ffffff",

  brand: {
    primary: "#6d41b0",
    secondary: "#51a018",
    accent: "#a1e1e1",
    accentEnd: "#bce2d4",
  },

  surface: {
    input: "#fbfae5",
    overlay: "#c7c3c3",
  },

  text: {
    primary: "#444",
    secondary: "#7B8B8E",
    muted: "#666",
    inverse: "#fff",
    /** Texto sobre fondos oscuros/brand (ej. tab bar inactivo) */
    inverseMuted: "rgba(255, 255, 255, 0.6)",
  },

  border: {
    light: "#c7c3c3",
    medium: "#999",
  },

  semantic: {
    success: "#51a018",
    error: "#d32f2f",
    /** Fondo suave para mensajes de error */
    errorMuted: "rgba(211, 47, 47, 0.15)",
    warning: "#f5a623",
    info: "#0a7ea4",
  },
  /**
   * Para app.json / Expo (no importable en JSON).
   * Mantener en sync: adaptiveIconBg, splashBg = background
   */
  config: {
    adaptiveIconBg: "#E6F4FE",
    splashBg: "#ffffff",
  },
} as const;

/** Auth gradient colors [start, end] */
export const authGradient = [palette.brand.accent, palette.brand.accentEnd] as const;
