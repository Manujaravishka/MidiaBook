import { Platform } from 'react-native'

export const Colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  primaryBg: '#EEF2FF',
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
  background: '#F8FAFC',
  backgroundAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.4)',
}

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
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40, color: Colors.text },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32, color: Colors.text },
  h3: { fontSize: 20, fontWeight: '700', lineHeight: 28, color: Colors.text },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24, color: Colors.text },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24, color: Colors.text },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: Colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16, color: Colors.textMuted },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20, color: Colors.text },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
} as const

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const
