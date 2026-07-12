import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import Badge from './Badge'

interface AppointmentCardProps {
  doctorName: string
  speciality: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

function AppointmentCard({ doctorName, speciality, date, time, status }: AppointmentCardProps) {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const month = dateObj.toLocaleString('default', { month: 'short' })

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.dateBox}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.center}>
        <Text style={styles.doctor}>Dr. {doctorName}</Text>
        <Text style={styles.spec}>{speciality}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      <Badge status={status} />
    </View>
  )
}

export default memo(AppointmentCard)

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 52,
  },
  day: {
    ...Typography.h4,
    color: Colors.primary,
    lineHeight: 22,
  },
  month: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 3,
    height: 40,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginLeft: Spacing.md,
  },
  center: {
    flex: 1,
  },
  doctor: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  spec: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  time: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
})
