import { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors, BorderRadius, Shadows } from '../../constants/theme'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
  padded?: boolean
}

export default function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  padded: {
    padding: 20,
  },
})
