// Color palette for the app
export const colors = {
  primary: "#3498db",
  secondary: "#e67e22",
  background: "#ffffff",
  card: "#f8f9fa",
  text: "#2d3436",
  textSecondary: "#636e72",
  border: "#dfe6e9",
  error: "#e74c3c",
  success: "#2ecc71",
  warning: "#f39c12",
  info: "#3498db",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  difficulty: {
    easy: "#2ecc71",
    moderate: "#f39c12",
    challenging: "#e74c3c",
    extreme: "#8e44ad",
  },
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: "#ccc",
    tabIconSelected: colors.primary,
  },
};
