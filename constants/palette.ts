/**
 * Nothyra color palette.
 * Use these tokens instead of hardcoded hex values.
 */

export const palette = {
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
    primary: "gray",
    secondary: "#7B8B8E",
    muted: "#666",
    inverse: "#fff",
  },
  border: {
    light: "#c7c3c3",
    medium: "#999",
  },
  semantic: {
    success: "#51a018",
    error: "#d32f2f",
    warning: "#f5a623",
    info: "#0a7ea4",
  },
} as const;

/** Auth gradient colors [start, end] */
export const authGradient = [palette.brand.accent, palette.brand.accentEnd] as const;
