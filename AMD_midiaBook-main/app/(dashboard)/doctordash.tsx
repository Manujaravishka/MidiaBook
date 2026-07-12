import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { subscribeDoctorAppointments, updateAppointmentStatus } from '../../services/appointmentService'
import { Appointment } from '../../types'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Button,
  StatCard,
  Avatar,
  Badge,
  SectionHeader,
  EmptyState,
  ConfirmDialog,
  SkeletonCard,
  SkeletonStatRow,
} from '../../components/ui'

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'confirmed' | 'completed'>('all')
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)
    const unsub = subscribeDoctorAppointments(user.uid, (list) => {
      setAppointments(list)
      setLoading(false)
    })
    return unsub
  }, [user?.uid])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const handleStatusChange = useCallback((appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    const labels: Record<string, string> = { confirmed: 'Accept', completed: 'Complete', cancelled: 'Reject' }
    setConfirmAction({
      visible: true,
      title: `${labels[newStatus]} Appointment`,
      message: `Are you sure you want to ${labels[newStatus].toLowerCase()} this appointment?`,
      onConfirm: async () => {
        try {
          await updateAppointmentStatus(appointmentId, newStatus)
          setConfirmAction((p) => ({ ...p, visible: false }))
        } catch {
          Alert.alert('Error', 'Failed to update appointment status')
        }
      },
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filteredAppointments = useMemo(() => {
    let list = appointments
    if (filter === 'today') list = list.filter((a) => a.appointmentDate === today)
    else if (filter === 'pending') list = list.filter((a) => a.status === 'pending')
    else if (filter === 'confirmed') list = list.filter((a) => a.status === 'confirmed')
    else if (filter === 'completed') list = list.filter((a) => a.status === 'completed')
    return list.sort((a, b) => {
      if (a.appointmentDate !== b.appointmentDate) return b.appointmentDate.localeCompare(a.appointmentDate)
      return (a.appointmentTime || '').localeCompare(b.appointmentTime || '')
    })
  }, [appointments, filter, today])

  const stats = useMemo(() => {
    const todayApps = appointments.filter((a) => a.appointmentDate === today)
    return {
      today: todayApps.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      total: appointments.length,
    }
  }, [appointments, today])

  const filters = [
    { key: 'all' as const, label: 'All', count: appointments.length },
    { key: 'today' as const, label: 'Today', count: stats.today },
    { key: 'pending' as const, label: 'Pending', count: stats.pending },
    { key: 'confirmed' as const, label: 'Confirmed', count: stats.confirmed },
  ]

  const getStatusAction = (status: string) => {
    if (status === 'pending') return { label: 'Accept', next: 'confirmed' as const, color: Colors.success }
    if (status === 'confirmed') return { label: 'Complete', next: 'completed' as const, color: Colors.primary }
    return null
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header title={`Dr. ${user?.fullName || 'Doctor'}`} subtitle="Doctor Dashboard" rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }} />

        {loading ? (
          <>
            <SkeletonStatRow />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard icon="calendar" label="Today" value={stats.today} color={Colors.primary} bg={Colors.primaryBg} />
              <StatCard icon="time" label="Pending" value={stats.pending} color={Colors.warning} bg={Colors.warningBg} />
              <StatCard icon="checkmark-circle" label="Confirmed" value={stats.confirmed} color={Colors.success} bg={Colors.successBg} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                    {f.label} ({f.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <SectionHeader title={filter === 'all' ? 'All Appointments' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Appointments`} count={filteredAppointments.length} />

            {filteredAppointments.length === 0 ? (
              <EmptyState icon="calendar-outline" title="No Appointments" message={filter === 'today' ? 'No appointments scheduled for today' : `No ${filter} appointments found`} />
            ) : (
              filteredAppointments.map((a) => (
                <Card key={a.id} style={styles.apptCard}>
                  <View style={styles.apptRow}>
                    <Avatar name={a.patientName} size="md" />
                    <View style={styles.apptInfo}>
                      <Text style={styles.patientName}>{a.patientName}</Text>
                      <Text style={styles.apptDetail}>{a.specialization} • {a.hospital}</Text>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.dateText}>{a.appointmentDate}</Text>
                        <Ionicons name="time-outline" size={13} color={Colors.textMuted} style={{ marginLeft: 8 }} />
                        <Text style={styles.dateText}>{a.appointmentTime}</Text>
                      </View>
                      {a.reason ? <Text style={styles.reason}>Reason: {a.reason}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.apptFooter}>
                    <Badge status={a.status} />
                    <View style={styles.apptActions}>
                      {getStatusAction(a.status) && (
                        <Button
                          title={getStatusAction(a.status)!.label}
                          onPress={() => handleStatusChange(a.id, getStatusAction(a.status)!.next)}
                          variant="primary"
                          fullWidth={false}
                          style={styles.smallBtn}
                        />
                      )}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <Button
                          title="Reject"
                          onPress={() => handleStatusChange(a.id, 'cancelled')}
                          variant="danger"
                          fullWidth={false}
                          style={styles.smallBtn}
                        />
                      )}
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmAction.visible}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((p) => ({ ...p, visible: false }))}
        variant={confirmAction.title.includes('Reject') ? 'danger' : 'primary'}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  filterRow: { marginBottom: Spacing.md },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundAlt,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.surface },
  apptCard: { marginBottom: Spacing.sm },
  apptRow: { flexDirection: 'row', alignItems: 'flex-start' },
  apptInfo: { flex: 1, marginLeft: Spacing.md },
  patientName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  apptDetail: { fontSize: 13, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  dateText: { fontSize: 12, color: Colors.textSecondary },
  reason: { fontSize: 13, color: Colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  apptFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  apptActions: { flexDirection: 'row', gap: Spacing.sm },
  smallBtn: { minWidth: 80, paddingHorizontal: Spacing.md, minHeight: 36 },
})
