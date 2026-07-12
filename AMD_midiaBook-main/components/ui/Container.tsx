import { ReactNode } from 'react'
import { SafeAreaView, View, StyleSheet } from 'react-native'
import { Colors, Spacing } from '../../constants/theme'

interface ContainerProps {
  children: ReactNode
  scrollable?: boolean
  padded?: boolean
}

export default function Container({ children, scrollable, padded = true }: ContainerProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, padded && styles.padded]}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.lg,
  },
})
