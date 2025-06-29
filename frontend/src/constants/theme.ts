export const colors = {
  primary: "#6366F1", // Indigo
  primaryLight: "#A5B4FC",
  primaryDark: "#4338CA",

  secondary: "#F59E0B", // Amber
  secondaryLight: "#FCD34D",
  secondaryDark: "#D97706",

  success: "#10B981", // Emerald
  error: "#EF4444", // Red
  warning: "#F59E0B", // Amber
  info: "#3B82F6", // Blue

  background: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  backgroundTertiary: "#F1F5F9",

  text: "#1E293B",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  textLight: "#CBD5E1",

  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  white: "#FFFFFF",
  black: "#000000",

  // Gen Z vibrant colors
  vibrantPink: "#EC4899",
  vibrantBlue: "#3B82F6",
  vibrantGreen: "#10B981",
  vibrantYellow: "#F59E0B",
  vibrantPurple: "#8B5CF6",
  vibrantOrange: "#F97316",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};
