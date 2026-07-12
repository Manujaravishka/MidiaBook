import { ReactNode } from 'react'
import { SafeAreaView, View, ScrollView, StyleSheet } from 'react-native'
import { Colors, Spacing } from '../../constants/theme'

interface ContainerProps {
  children: ReactNode
  scrollable?: boolean
  padded?: boolean
}

export default function Container({ children, scrollable = true, padded = true }: ContainerProps) {
  const content = <View style={[styles.container, padded && styles.padded]}>{children}</View>

  return (
    <SafeAreaView style={styles.safe}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
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
  scrollContent: {
    flexGrow: 1,
  },
})
