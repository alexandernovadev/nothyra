/**
 * Nothyra color palette.
 * Order: always use tokens, never hard-coded hex in components.
 *
 * 1. background — app base
 * 2. brand      — Nothyra identity
 * 3. surface    — inputs, overlays
 * 4. text       — typography
 * 5. border     — dividers
 * 6. semantic   — success, error, warning, info
 */

export const palette = {
  /** Primary screen background */
  background: "#ffffff",

  brand: {
    primary: "#6d41b0",
    /** Purple tints (forms, energy chips) */
    primaryMuted: "rgba(109, 65, 176, 0.07)",
    primaryBorderSoft: "rgba(109, 65, 176, 0.16)",
    primaryChipFill: "rgba(109, 65, 176, 0.12)",
    secondary: "#299419",
    /** Soft fill for date headers / green accents (matches secondary) */
    secondaryMuted: "rgba(41, 148, 25, 0.1)",
    secondaryBorderSoft: "rgba(41, 148, 25, 0.22)",
    accent: "#a1e1e1",
    accentEnd: "#bce2d4",
  },

  surface: {
    input: "#fbfae5",
    overlay: "#c7c3c3",
    /** Panels sobre gradiente (p. ej. lista de síntomas en el formulario) */
    panelTranslucent: "rgba(255, 255, 255, 0.5)",
    panelTranslucentBorder: "rgba(109, 65, 176, 0.18)",
    /** Cuerpo completo del formulario (p. ej. recetas) sobre el gradiente */
    formSheet: "rgba(255, 255, 255, 0.82)",
    /** Checkbox vacío sobre panel translúcido */
    checkboxIdle: "rgba(255, 255, 255, 0.72)",
  },

  text: {
    primary: "#444",
    secondary: "#7B8B8E",
    muted: "#666",
    inverse: "#fff",
    /** Text on dark / brand surfaces (e.g. inactive tab label) */
    inverseMuted: "rgba(255, 255, 255, 0.6)",
  },

  border: {
    light: "#c7c3c3",
    medium: "#999",
  },

  semantic: {
    success: "#51a018",
    error: "#d32f2f",
    /** Soft fill for inline error messages */
    errorMuted: "rgba(211, 47, 47, 0.15)",
    warning: "#f5a623",
    info: "#0a7ea4",
    infoMuted: "rgba(10, 126, 164, 0.07)",
    infoBorderSoft: "rgba(10, 126, 164, 0.16)",
    infoInputBorder: "rgba(10, 126, 164, 0.2)",
  },
  /**
   * Mirrors app.json / Expo config (not importable from JSON).
   * Keep in sync: adaptiveIconBg, splashBg ≈ background
   */
  config: {
    adaptiveIconBg: "#E6F4FE",
    splashBg: "#ffffff",
  },
} as const;

/** Main gradient colors [start, end] */
export const mainGradient = [
  palette.brand.accent,
  palette.brand.accentEnd,
] as const;
