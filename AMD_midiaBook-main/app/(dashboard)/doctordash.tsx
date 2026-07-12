import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { subscribeDoctorAppointments, updateAppointmentStatus } from '../../services/appointmentService'
import { Appointment } from '../../types'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'
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
} from '../../components/ui'

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'accepted' | 'confirmed' | 'completed' | 'rejected'>('all')
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start()
  }, [fadeAnim])

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

  const handleStatusChange = useCallback((appointmentId: string, newStatus: 'accepted' | 'completed' | 'rejected') => {
    const labels: Record<string, string> = { accepted: 'Accept', completed: 'Complete', rejected: 'Reject' }
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
    else if (filter === 'accepted' || filter === 'confirmed') list = list.filter((a) => a.status === 'accepted' || a.status === 'confirmed')
    else if (filter === 'completed') list = list.filter((a) => a.status === 'completed')
    else if (filter === 'rejected') list = list.filter((a) => a.status === 'rejected')
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
      confirmed: appointments.filter((a) => a.status === 'accepted' || a.status === 'confirmed').length,
      total: appointments.length,
    }
  }, [appointments, today])

  const filters = [
    { key: 'all' as const, label: 'All', count: appointments.length },
    { key: 'today' as const, label: 'Today', count: stats.today },
    { key: 'pending' as const, label: 'Pending', count: stats.pending },
    { key: 'accepted' as const, label: 'Accepted', count: stats.confirmed },
    { key: 'rejected' as const, label: 'Rejected', count: appointments.filter((a) => a.status === 'rejected').length },
  ]

  const getStatusAction = (status: string) => {
    if (status === 'pending') return { label: 'Accept', next: 'accepted' as const, color: Colors.success }
    if (status === 'accepted' || status === 'confirmed') return { label: 'Complete', next: 'completed' as const, color: Colors.primary }
    return null
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header
          title={`Dr. ${user?.fullName || 'Doctor'}`}
          subtitle="Doctor Dashboard"
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar name={`Dr. ${user?.fullName || ''}`} size="lg" />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Dr. {user?.fullName}</Text>
                <Text style={styles.profileRole}>General Physician</Text>
                <View style={styles.profileStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Available</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon="calendar" label="Today" value={stats.today} color={Colors.primary} bg={Colors.primaryBg} />
            <StatCard icon="time" label="Pending" value={stats.pending} color={Colors.warning} bg={Colors.warningBg} />
            <StatCard icon="checkmark-circle" label="Accepted" value={stats.confirmed} color={Colors.success} bg={Colors.successBg} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                  {f.label} ({f.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionHeader title={filter === 'all' ? 'All Appointments' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Appointments`} count={filteredAppointments.length} />

          {loading ? (
            <>
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </>
          ) : filteredAppointments.length === 0 ? (
            <EmptyState icon="calendar-outline" title="No Appointments" message={filter === 'today' ? 'No appointments scheduled for today' : `No ${filter} appointments found`} />
          ) : (
            filteredAppointments.map((a) => (
              <Card key={a.id} style={styles.apptCard}>
                <View style={styles.apptHeader}>
                  <View style={styles.apptPatientRow}>
                    <Avatar name={a.patientName} size="md" />
                    <View style={styles.apptPatientInfo}>
                      <Text style={styles.patientName}>{a.patientName}</Text>
                      <Text style={styles.apptDetail}>{a.specialization} • {a.hospital}</Text>
                    </View>
                  </View>
                  <Badge status={a.status} />
                </View>
                <View style={styles.apptDivider} />
                <View style={styles.apptBody}>
                  <View style={styles.apptMetaRow}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <Text style={styles.apptMetaText}>{a.appointmentDate}</Text>
                    <Ionicons name="time-outline" size={15} color={Colors.primary} style={{ marginLeft: 12 }} />
                    <Text style={styles.apptMetaText}>{a.appointmentTime}</Text>
                  </View>
                  {a.reason ? (
                    <View style={styles.reasonRow}>
                      <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.textMuted} />
                      <Text style={styles.reasonText}>{a.reason}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.apptActions}>
                  {getStatusAction(a.status) && (
                    <View style={styles.actionBtnWrapper}>
                      <Button
                        title={getStatusAction(a.status)!.label}
                        onPress={() => handleStatusChange(a.id, getStatusAction(a.status)!.next)}
                        variant={getStatusAction(a.status)!.next === 'accepted' ? 'primary' : 'primary'}
                      />
                    </View>
                  )}
                  {(a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed') && (
                    <View style={styles.actionBtnWrapper}>
                      <Button
                        title="Reject"
                        onPress={() => handleStatusChange(a.id, 'rejected')}
                        variant="danger"
                      />
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}

          <View style={{ height: Spacing.xxl }} />
        </Animated.View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmAction.visible}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((p) => ({ ...p, visible: false }))}
        variant={confirmAction.title.includes('Complete') ? 'primary' : 'danger'}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.text,
  },
  profileRole: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
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
  apptCard: { marginBottom: Spacing.md },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  apptPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  apptPatientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  apptDetail: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  apptDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  apptBody: {
    gap: Spacing.sm,
  },
  apptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apptMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  apptActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtnWrapper: {
    flex: 1,
  },
})
