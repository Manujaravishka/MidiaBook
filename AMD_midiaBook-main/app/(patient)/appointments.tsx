import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { subscribePatientAppointments, updateAppointmentStatus } from '../../services/appointmentService'
import { Appointment } from '../../types'
import { Spacing, BorderRadius } from '../../constants/theme'
import { Card, Avatar, Badge, EmptyState, ConfirmDialog } from '../../components/ui'

type FilterKey = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function AppointmentsScreen() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<FilterKey>('all')
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribePatientAppointments(user.uid, setAppointments)
    return unsub
  }, [user?.uid])

  const filteredAppointments = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return appointments.filter((a) => a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed')
      case 'completed':
        return appointments.filter((a) => a.status === 'completed')
      case 'cancelled':
        return appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected')
      default:
        return appointments
    }
  }, [appointments, filter])

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
  }, [filteredAppointments])

  const handleCancel = useCallback((appointment: Appointment) => {
    setConfirmAction({
      visible: true,
      title: 'Cancel Appointment',
      message: `Cancel your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}?`,
      onConfirm: async () => {
        try {
          await updateAppointmentStatus(appointment.id, 'cancelled')
          setConfirmAction((p) => ({ ...p, visible: false }))
        } catch {
          Alert.alert('Error', 'Failed to cancel appointment')
        }
      },
    })
  }, [])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  if (!user) return null

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>My Appointments</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, { color: filter === f.key ? '#FFF' : colors.textSecondary }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {sortedAppointments.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No Appointments"
              message={filter === 'all' ? 'Book your first appointment with a specialist' : `No ${filter} appointments found`}
            />
          ) : (
            sortedAppointments.map((a) => (
              <Card key={a.id} style={styles.apptCard}>
                <View style={styles.apptHeader}>
                  <View style={styles.apptRow}>
                    <Avatar name={a.doctorName} size="md" />
                    <View style={styles.apptInfo}>
                      <Text style={[styles.apptDoctor, { color: colors.text }]}>Dr. {a.doctorName}</Text>
                      <Text style={[styles.apptSpec, { color: colors.primary }]}>{a.specialization}</Text>
                    </View>
                    <Badge status={a.status === 'confirmed' ? 'accepted' : a.status} />
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{a.appointmentDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{a.appointmentTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{a.hospital}</Text>
                </View>
                {a.reason && (
                  <View style={styles.detailRow}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{a.reason}</Text>
                  </View>
                )}

                {(a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed') && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(a)} activeOpacity={0.7}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                    <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel Appointment</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>

      <ConfirmDialog
        visible={confirmAction.visible}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((p) => ({ ...p, visible: false }))}
        variant="danger"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  apptCard: { marginBottom: Spacing.sm },
  apptHeader: { marginBottom: Spacing.sm },
  apptRow: { flexDirection: 'row', alignItems: 'center' },
  apptInfo: { flex: 1, marginLeft: Spacing.md },
  apptDoctor: { fontSize: 16, fontWeight: '700' },
  apptSpec: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, marginVertical: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  detailText: { fontSize: 14, flex: 1 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  cancelText: { fontSize: 14, fontWeight: '600' },
})
