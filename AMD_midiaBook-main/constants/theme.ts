import { Platform } from 'react-native'

export const Colors = {
  primary: '#4F6EF7',
  primaryDark: '#3B5BDB',
  primaryLight: '#A8C0FF',
  primaryBg: '#EDF2FF',
  secondary: '#14B8A6',
  secondaryBg: '#F0FDFA',
  accent: '#F59E0B',
  accentBg: '#FFFBEB',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  success: '#10B981',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  surface: '#FFFFFF',
  background: '#F4F6FA',
  backgroundAlt: '#EDF0F5',
  text: '#0B1432',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.4)',
}

export const DarkColors = {
  primary: '#6B8AFF',
  primaryDark: '#5A7AEE',
  primaryLight: '#A8C0FF',
  primaryBg: '#1E2440',
  secondary: '#34D399',
  secondaryBg: '#0F2A24',
  accent: '#FBBF24',
  accentBg: '#2A2410',
  danger: '#F87171',
  dangerBg: '#2A1010',
  success: '#34D399',
  successBg: '#0F2A1E',
  warning: '#FBBF24',
  warningBg: '#2A2410',
  surface: '#1A1D2E',
  background: '#111422',
  backgroundAlt: '#1E2136',
  text: '#E8ECF4',
  textSecondary: '#9CA3B8',
  textMuted: '#6B7280',
  border: '#2A2D42',
  borderLight: '#222539',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
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
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
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
