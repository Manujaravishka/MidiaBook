import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { subscribeDoctors, subscribeStats, subscribeRecentUsers, addDoctor, updateDoctor, toggleDoctorStatus } from '../../services/adminService'
import { DoctorProfile, UserData, DashboardStats } from '../../types'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Input,
  Button,
  Avatar,
  StatCard,
  SearchBar,
  ConfirmDialog,
  SectionHeader,
  EmptyState,
  SkeletonStatRow,
  SkeletonCard,
} from '../../components/ui'

type ViewMode = 'dashboard' | 'doctors' | 'addDoctor' | 'editDoctor'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserData[]>([])
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

  useEffect(() => {
    const unsubDocs = subscribeDoctors(setDoctors)
    const unsubStats = subscribeStats(setStats)
    return () => { unsubDocs(); unsubStats() }
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
    <>
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Total Doctors" value={stats?.totalDoctors || 0} color={Colors.primary} bg={Colors.primaryBg} />
        <StatCard icon="person-add" label="Total Patients" value={stats?.totalPatients || 0} color={Colors.secondary} bg={Colors.secondaryBg} />
        <StatCard icon="calendar" label="Today" value={stats?.todayAppointments || 0} color={Colors.accent} bg={Colors.accentBg} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="time" label="Pending" value={stats?.pendingAppointments || 0} color={Colors.warning} bg={Colors.warningBg} />
        <StatCard icon="checkmark-circle" label="Confirmed" value={stats?.confirmedAppointments || 0} color={Colors.primary} bg={Colors.primaryBg} />
        <StatCard icon="checkmark-done" label="Completed" value={stats?.completedAppointments || 0} color={Colors.success} bg={Colors.successBg} />
      </View>

      <Card style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setViewMode('doctors')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryBg }]}>
              <Ionicons name="people" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Manage Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { resetForm(); setViewMode('addDoctor') }}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.successBg }]}>
              <Ionicons name="person-add" size={22} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>Add Doctor</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </>
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
          <Ionicons name={editingDoctor ? 'create-outline' : 'person-add'} size={22} color={Colors.primary} />
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

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header title="Admin Panel" subtitle={user?.fullName} rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }} />

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
  sectionTitle: { ...Typography.h4, color: Colors.text },
  quickActions: { marginBottom: Spacing.lg },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  actionBtn: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
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
  formActions: { gap: Spacing.sm, marginTop: Spacing.sm },
})
