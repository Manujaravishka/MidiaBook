import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { subscribeDoctors, subscribeStats, subscribeRecentUsers, addDoctor, updateDoctor, toggleDoctorStatus } from '../../services/adminService'
import { subscribeAllAppointments, updateAppointmentStatus } from '../../services/appointmentService'
import { DoctorProfile, UserData, DashboardStats, Appointment } from '../../types'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Input,
  Button,
  Avatar,
  Badge,
  StatCard,
  SearchBar,
  ConfirmDialog,
  SectionHeader,
  EmptyState,
  SkeletonStatRow,
  SkeletonCard,
} from '../../components/ui'

type ViewMode = 'dashboard' | 'doctors' | 'addDoctor' | 'editDoctor' | 'appointments'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserData[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [apptFilter, setApptFilter] = useState<'all' | 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'>('all')
  const [apptSearch, setApptSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', gender: '',
    specialization: '', hospital: '', experience: '', qualification: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start()
  }, [fadeAnim])

  useEffect(() => {
    const unsubDocs = subscribeDoctors(setDoctors)
    const unsubStats = subscribeStats(setStats)
    const unsubApps = subscribeAllAppointments(setAppointments)
    return () => { unsubDocs(); unsubStats(); unsubApps() }
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const resetForm = useCallback(() => {
    setForm({ fullName: '', email: '', password: '', phone: '', gender: '', specialization: '', hospital: '', experience: '', qualification: '' })
    setEditingDoctor(null)
  }, [])

  const openEditDoctor = useCallback((doctor: DoctorProfile) => {
    setForm({
      fullName: doctor.fullName,
      email: doctor.email,
      password: '',
      phone: doctor.phone || '',
      gender: doctor.gender || '',
      specialization: doctor.specialization || '',
      hospital: doctor.hospital || '',
      experience: String(doctor.experience || ''),
      qualification: doctor.qualification || '',
    })
    setEditingDoctor(doctor)
    setViewMode('editDoctor')
  }, [])

  const handleSubmitDoctor = useCallback(async () => {
    if (!form.fullName || !form.specialization) {
      return Alert.alert('Missing Fields', 'Name and specialization are required')
    }
    if (!editingDoctor && (!form.email || !form.password)) {
      return Alert.alert('Missing Fields', 'Email and password are required for new doctors')
    }

    setSubmitting(true)
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.uid, {
          fullName: form.fullName,
          phone: form.phone,
          gender: form.gender,
          specialization: form.specialization,
          hospital: form.hospital,
          experience: Number(form.experience),
          qualification: form.qualification,
        })
        Alert.alert('Success', 'Doctor updated successfully')
      } else {
        await addDoctor(
          form.fullName, form.email, form.password, form.phone,
          form.gender, form.specialization, form.hospital,
          form.experience, form.qualification
        )
        Alert.alert('Success', 'Doctor added successfully')
      }
      resetForm()
      setViewMode('doctors')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }, [form, editingDoctor, resetForm])

  const handleToggleStatus = useCallback((doctor: DoctorProfile) => {
    const newStatus = doctor.accountStatus === 'active' ? 'deactivate' : 'activate'
    setConfirmAction({
      visible: true,
      title: `${newStatus === 'deactivate' ? 'Deactivate' : 'Activate'} Doctor`,
      message: `Are you sure you want to ${newStatus} Dr. ${doctor.fullName}?`,
      onConfirm: async () => {
        try {
          await toggleDoctorStatus(doctor.uid, doctor.accountStatus)
          setConfirmAction((p) => ({ ...p, visible: false }))
        } catch {
          Alert.alert('Error', 'Failed to update status')
        }
      },
    })
  }, [])

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors
    const q = searchQuery.toLowerCase()
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q)
    )
  }, [doctors, searchQuery])

  const renderDashboard = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Total Doctors" value={stats?.totalDoctors || 0} color={Colors.primary} bg={Colors.primaryBg} />
        <StatCard icon="person-add" label="Total Patients" value={stats?.totalPatients || 0} color={Colors.accent} bg={Colors.accentBg} />
        <StatCard icon="calendar" label="Today" value={stats?.todayAppointments || 0} color={Colors.primary} bg={Colors.primaryBg} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="time" label="Pending" value={stats?.pendingAppointments || 0} color={Colors.warning} bg={Colors.warningBg} />
        <StatCard icon="checkmark-circle" label="Accepted" value={stats?.acceptedAppointments || 0} color={Colors.success} bg={Colors.successBg} />
        <StatCard icon="checkmark-done" label="Completed" value={stats?.completedAppointments || 0} color={Colors.primary} bg={Colors.primaryBg} />
        <StatCard icon="close-circle" label="Rejected" value={stats?.rejectedAppointments || 0} color={Colors.danger} bg={Colors.dangerBg} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => setViewMode('doctors')} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.primaryBg }]}>
            <Ionicons name="people" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionCardLabel}>Manage Doctors</Text>
          <Text style={styles.actionCardDesc}>{stats?.totalDoctors || 0} doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => { resetForm(); setViewMode('addDoctor') }} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.successBg }]}>
            <Ionicons name="person-add" size={24} color={Colors.success} />
          </View>
          <Text style={styles.actionCardLabel}>Add Doctor</Text>
          <Text style={styles.actionCardDesc}>Register new doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => setViewMode('appointments')} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.primaryBg }]}>
            <Ionicons name="calendar" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionCardLabel}>Appointments</Text>
          <Text style={styles.actionCardDesc}>View all bookings</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const renderDoctorList = () => (
    <>
      <View style={styles.viewHeader}>
        <TouchableOpacity onPress={() => { setViewMode('dashboard'); setSearchQuery('') }}>
          <Text style={styles.backLink}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name, specialization, hospital..." />
      <SectionHeader title={`Doctors (${filteredDoctors.length})`} action={{ label: '+ Add', onPress: () => { resetForm(); setViewMode('addDoctor') }}} />
      {filteredDoctors.map((d) => (
        <Card key={d.uid} style={styles.doctorCard}>
          <View style={styles.docRow}>
            <Avatar name={d.fullName} size="md" />
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Dr. {d.fullName}</Text>
              <Text style={styles.docSpec}>{d.specialization}</Text>
              <Text style={styles.docDetail}>{d.hospital} • {d.email}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: d.accountStatus === 'active' ? Colors.success : Colors.textMuted }]} />
          </View>
          <View style={styles.docActions}>
            <TouchableOpacity style={styles.docActionBtn} onPress={() => openEditDoctor(d)}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.docActionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.docActionBtn} onPress={() => handleToggleStatus(d)}>
              <Ionicons name={d.accountStatus === 'active' ? 'pause-circle-outline' : 'checkmark-circle-outline'} size={16} color={d.accountStatus === 'active' ? Colors.warning : Colors.success} />
              <Text style={[styles.docActionText, { color: d.accountStatus === 'active' ? Colors.warning : Colors.success }]}>
                {d.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
      {filteredDoctors.length === 0 && !searchQuery && (
        <EmptyState icon="medical-outline" title="No Doctors Yet" message="Add your first doctor to get started" actionLabel="Add Doctor" onAction={() => { resetForm(); setViewMode('addDoctor') }} />
      )}
    </>
  )

  const renderDoctorForm = () => (
    <>
      <View style={styles.viewHeader}>
        <TouchableOpacity onPress={() => { resetForm(); setViewMode('doctors') }}>
          <Text style={styles.backLink}>← Back to Doctors</Text>
        </TouchableOpacity>
      </View>
      <Card>
        <View style={styles.formHeader}>
          <View style={[styles.formIconWrap, { backgroundColor: Colors.primaryBg }]}>
            <Ionicons name={editingDoctor ? 'create-outline' : 'person-add'} size={22} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</Text>
        </View>
        <Input label="Full Name" icon="person-outline" value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} placeholder="Dr. John Smith" />
        {!editingDoctor && (
          <>
            <Input label="Email" icon="mail-outline" value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="doctor@hospital.com" autoCapitalize="none" keyboardType="email-address" />
            <Input label="Password" icon="lock-closed-outline" value={form.password} onChangeText={(v) => setForm((p) => ({ ...p, password: v }))} placeholder="Temporary password" isPassword />
          </>
        )}
        <Input label="Phone" icon="call-outline" value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="+1 234 567 890" keyboardType="phone-pad" />
        <Input label="Gender" icon="male-female-outline" value={form.gender} onChangeText={(v) => setForm((p) => ({ ...p, gender: v }))} placeholder="Male / Female / Other" />
        <Input label="Specialization" icon="medical-outline" value={form.specialization} onChangeText={(v) => setForm((p) => ({ ...p, specialization: v }))} placeholder="e.g. Cardiologist" />
        <Input label="Hospital" icon="home-outline" value={form.hospital} onChangeText={(v) => setForm((p) => ({ ...p, hospital: v }))} placeholder="Hospital name" />
        <Input label="Experience (years)" icon="time-outline" value={form.experience} onChangeText={(v) => setForm((p) => ({ ...p, experience: v }))} placeholder="10" keyboardType="numeric" />
        <Input label="Qualification" icon="school-outline" value={form.qualification} onChangeText={(v) => setForm((p) => ({ ...p, qualification: v }))} placeholder="MD, MBBS, etc." />
        <View style={styles.formActions}>
          <Button title={editingDoctor ? 'Update Doctor' : 'Register Doctor'} onPress={handleSubmitDoctor} loading={submitting} />
          <Button title="Cancel" onPress={() => { resetForm(); setViewMode('doctors') }} variant="ghost" />
        </View>
      </Card>
    </>
  )

  const handleAdminCancelAppointment = useCallback((appointment: Appointment) => {
    setConfirmAction({
      visible: true,
      title: 'Cancel Appointment',
      message: `Cancel appointment for ${appointment.patientName} with Dr. ${appointment.doctorName}?`,
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

  const apptFilterChips = [
    { key: 'all' as const, label: 'All' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'accepted' as const, label: 'Accepted' },
    { key: 'completed' as const, label: 'Completed' },
    { key: 'rejected' as const, label: 'Rejected' },
    { key: 'cancelled' as const, label: 'Cancelled' },
  ]

  const filteredAppointments = useMemo(() => {
    let list = appointments
    if (apptFilter !== 'all') {
      list = list.filter((a) => a.status === apptFilter || (apptFilter === 'accepted' && a.status === 'confirmed'))
    }
    if (apptSearch.trim()) {
      const q = apptSearch.toLowerCase()
      list = list.filter((a) => a.patientName?.toLowerCase().includes(q) || a.doctorName?.toLowerCase().includes(q) || a.hospital?.toLowerCase().includes(q))
    }
    return list
  }, [appointments, apptFilter, apptSearch])

  const renderAppointments = () => (
    <>
      <View style={styles.viewHeader}>
        <TouchableOpacity onPress={() => { setViewMode('dashboard') }}>
          <Text style={styles.backLink}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
      <SearchBar value={apptSearch} onChangeText={setApptSearch} placeholder="Search by patient, doctor, hospital..." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {apptFilterChips.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, apptFilter === f.key && styles.filterChipActive]}
            onPress={() => setApptFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, apptFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <SectionHeader title={`Appointments (${filteredAppointments.length})`} />
      {filteredAppointments.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No Appointments" message="No appointments match the current filter" />
      ) : (
        filteredAppointments.map((a) => (
          <Card key={a.id} style={styles.apptCard}>
            <View style={styles.apptHeader}>
              <View style={styles.apptPersonRow}>
                <Avatar name={a.patientName} size="md" />
                <View style={styles.apptPersonInfo}>
                  <Text style={styles.apptPersonName}>{a.patientName}</Text>
                  <Text style={styles.apptPersonMeta}>Dr. {a.doctorName} • {a.specialization}</Text>
                  <Text style={styles.apptPersonMeta}>{a.hospital}</Text>
                </View>
              </View>
              <Badge status={a.status === 'confirmed' ? 'accepted' : a.status} />
            </View>
            <View style={styles.apptDivider} />
            <View style={styles.apptBody}>
              <View style={styles.apptDetailRow}>
                <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                <Text style={styles.apptDetailText}>{a.appointmentDate}</Text>
                <Ionicons name="time-outline" size={15} color={Colors.primary} style={{ marginLeft: 12 }} />
                <Text style={styles.apptDetailText}>{a.appointmentTime}</Text>
              </View>
              {a.reason ? (
                <View style={styles.apptDetailRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.textMuted} />
                  <Text style={[styles.apptDetailText, { color: Colors.textMuted, fontStyle: 'italic' }]}>{a.reason}</Text>
                </View>
              ) : null}
            </View>
            {(a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed') && (
              <TouchableOpacity onPress={() => handleAdminCancelAppointment(a)} style={styles.cancelRow}>
                <Ionicons name="close-circle-outline" size={18} color={Colors.danger} />
                <Text style={styles.cancelText}>Cancel Appointment</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))
      )}
    </>
  )

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header
          title="Admin Panel"
          subtitle={user?.fullName}
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        {!stats && doctors.length === 0 ? (
          <>
            <SkeletonStatRow />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : viewMode === 'dashboard' ? (
          renderDashboard()
        ) : viewMode === 'doctors' ? (
          renderDoctorList()
        ) : viewMode === 'appointments' ? (
          renderAppointments()
        ) : (
          renderDoctorForm()
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmAction.visible}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((p) => ({ ...p, visible: false }))}
        variant={confirmAction.title.includes('Deactivate') ? 'danger' : 'primary'}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  actionCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  viewHeader: { marginBottom: Spacing.md },
  backLink: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  doctorCard: { marginBottom: Spacing.sm },
  docRow: { flexDirection: 'row', alignItems: 'center' },
  docInfo: { flex: 1, marginLeft: Spacing.md },
  docName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  docSpec: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 2 },
  docDetail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  docActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  docActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docActionText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  formIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formActions: { gap: Spacing.sm, marginTop: Spacing.sm },
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
  apptCard: { marginBottom: Spacing.md },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  apptPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  apptPersonInfo: {
    flex: 1,
  },
  apptPersonName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  apptPersonMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  apptDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  apptBody: {
    gap: Spacing.sm,
  },
  apptDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  apptDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
})
