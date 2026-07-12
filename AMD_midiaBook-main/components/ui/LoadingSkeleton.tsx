import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { Colors, BorderRadius, Spacing } from '../../constants/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

export function Skeleton({ width = '100%', height = 20, borderRadius = BorderRadius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: Colors.border, opacity }, style]}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={s.col}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${90 - i * 15}%`} height={14} style={{ marginTop: 8 }} />
      ))}
    </View>
  )
}

export function SkeletonStatRow() {
  return (
    <View style={s.statRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={s.statBox}>
          <Skeleton width={36} height={36} borderRadius={10} />
          <Skeleton width={30} height={24} style={{ marginTop: 6 }} />
          <Skeleton width="80%" height={12} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
})
