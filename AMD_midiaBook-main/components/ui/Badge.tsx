import { View, Text, StyleSheet } from 'react-native'
import { Colors, BorderRadius } from '../../constants/theme'

interface BadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

const config = {
  pending: { bg: Colors.warningBg, text: Colors.warning, label: 'Pending' },
  confirmed: { bg: Colors.primaryBg, text: Colors.primary, label: 'Confirmed' },
  completed: { bg: Colors.successBg, text: Colors.success, label: 'Completed' },
  cancelled: { bg: Colors.dangerBg, text: Colors.danger, label: 'Cancelled' },
}

export default function Badge({ status }: BadgeProps) {
  const c = config[status] || config.pending
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.text }]} />
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})
