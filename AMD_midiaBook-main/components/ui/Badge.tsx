import { View, Text, StyleSheet } from 'react-native'
import { BorderRadius } from '../../constants/theme'

interface BadgeProps {
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
  accepted: { bg: '#DCFCE7', text: '#16A34A', label: 'Accepted' },
  confirmed: { bg: '#DCFCE7', text: '#16A34A', label: 'Accepted' },
  completed: { bg: '#DBEAFE', text: '#2563EB', label: 'Completed' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Cancelled' },
  rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },
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
