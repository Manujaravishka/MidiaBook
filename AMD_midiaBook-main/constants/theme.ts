import { Platform } from 'react-native'

export const Colors = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#86EFAC',
  primaryBg: '#F0FDF4',
  secondary: '#0F172A',
  secondaryBg: '#F1F5F9',
  accent: '#14B8A6',
  accentBg: '#F0FDFA',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  backgroundAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.4)',
  gradientStart: '#16A34A',
  gradientEnd: '#15803D',
  cardGreen: '#F0FDF4',
  navyBg: '#0F172A',
}

export const DarkColors = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#86EFAC',
  primaryBg: '#052E16',
  secondary: '#14B8A6',
  secondaryBg: '#0F2A24',
  accent: '#2DD4BF',
  accentBg: '#0F2A24',
  danger: '#F87171',
  dangerBg: '#2A1010',
  success: '#22C55E',
  successBg: '#052E16',
  warning: '#FBBF24',
  warningBg: '#2A2410',
  surface: '#1A1D2E',
  background: '#0F172A',
  backgroundAlt: '#1E2136',
  text: '#E8ECF4',
  textSecondary: '#9CA3B8',
  textMuted: '#6B7280',
  border: '#2A2D42',
  borderLight: '#222539',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  gradientStart: '#16A34A',
  gradientEnd: '#0D6B2E',
  cardGreen: '#052E16',
  navyBg: '#0F172A',
}

export type ThemeColors = typeof Colors

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    rounded: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    rounded: 'System',
    mono: 'monospace',
  },
})

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700', lineHeight: 34 },
  h3: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
} as const

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const
