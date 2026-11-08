/** Veza brand tokens (PRD 14.1). Single source for TS consumers (charts, 3D, heatmap). */
export const lime = {
  50: "#F6FAE7",
  100: "#EAF4C6",
  200: "#DAEB9C",
  300: "#C8E070",
  400: "#B8D74F",
  500: "#ABCF37",
  600: "#8DAE27",
  700: "#6C861F",
  800: "#4D5F18",
  900: "#2F3A10",
} as const;

export const neutral = {
  0: "#FFFFFF",
  50: "#F5F7FA",
  100: "#E8ECF1",
  200: "#CDD4DD",
  400: "#8B95A3",
  600: "#4A5361",
  800: "#1A2029",
  900: "#11161D",
  950: "#0B0F14",
} as const;

export const brand = { lime: lime[500], deepSpace: "#0B0F14", ink: "#231F20" } as const;

export const industry = {
  AVI: "#4FA3FF",
  ENG: "#FFB547",
  CUL: "#FF6B5A",
  MED: "#3FD1B5",
  AGR: "#ABCF37",
} as const;
export type IndustryCode = keyof typeof industry;

export const semantic = {
  success: "#3FB950",
  warning: "#F2B233",
  danger: "#F25F5C",
  info: "#4FA3FF",
} as const;
