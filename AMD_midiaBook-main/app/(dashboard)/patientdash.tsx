import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Alert, Platform, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../../context/AuthContext'
import { subscribeActiveDoctors } from '../../services/doctorService'
import { subscribePatientAppointments, bookAppointment, updateAppointmentStatus } from '../../services/appointmentService'
import { DoctorProfile, Appointment } from '../../types'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Button,
  Input,
  Avatar,
  Badge,
  SearchBar,
  SectionHeader,
  EmptyState,
  ConfirmDialog,
} from '../../components/ui'

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
]

export default function PatientDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  const headerFade = useRef(new Animated.Value(0)).current
  const statsSlide = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(statsSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [headerFade, statsSlide])

  useEffect(() => {
    const unsubDocs = subscribeActiveDoctors(setDoctors)
    if (user?.uid) {
      const unsubApps = subscribePatientAppointments(user.uid, setAppointments)
      return () => { unsubDocs(); unsubApps() }
    }
    return unsubDocs
  }, [user?.uid])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors
    const q = searchQuery.toLowerCase()
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q)
    )
  }, [doctors, searchQuery])

  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleBookAppointment = useCallback(async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in')
    if (!selectedDoctor || !selectedTime || !reason.trim()) {
      return Alert.alert('Missing Fields', 'Please select doctor, time, and provide a reason')
    }

    setSubmitting(true)
    try {
      const success = await bookAppointment(
        user.uid,
        user.fullName,
        user.email,
        selectedDoctor.uid,
        selectedDoctor.fullName,
        selectedDoctor.email,
        selectedDoctor.specialization || '',
        selectedDoctor.hospital || '',
        formatDate(date),
        selectedTime,
        reason.trim()
      )

      if (!success) {
        return Alert.alert('Unavailable', 'This time slot is already booked. Please choose another.')
      }

      Alert.alert('Success', 'Appointment booked successfully!')
      setSelectedDoctor(null)
      setSelectedTime(null)
      setReason('')
      setDate(new Date())
      setShowBooking(false)
    } catch {
      Alert.alert('Error', 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }, [user, selectedDoctor, selectedTime, reason, date])

  const handleCancelAppointment = useCallback((appointment: Appointment) => {
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

  const stats = useMemo(() => {
    const upcoming = appointments.filter((a) => a.status === 'accepted' || a.status === 'confirmed' || a.status === 'pending')
    return {
      upcoming: upcoming.length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      total: appointments.length,
    }
  }, [appointments])

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
  }, [appointments])

  if (!user) return null

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header
          title={`Hi, ${user.fullName?.split(' ')[0] || 'Patient'}`}
          subtitle="Patient Dashboard"
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: statsSlide }] }}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeRow}>
              <Avatar name={user.fullName} size="lg" />
              <View style={styles.welcomeInfo}>
                <Text style={styles.welcomeGreeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</Text>
                <Text style={styles.welcomeName}>{user.fullName}</Text>
                <Text style={styles.welcomeRole}>Patient</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: Colors.primaryBg }]}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
              <Text style={[styles.statNum, { color: Colors.primary }]}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: Colors.successBg }]}>
              <Ionicons name="checkmark-done" size={22} color={Colors.success} />
              <Text style={[styles.statNum, { color: Colors.success }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: Colors.backgroundAlt }]}>
              <Ionicons name="documents" size={22} color={Colors.textSecondary} />
              <Text style={[styles.statNum, { color: Colors.text }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Animated.View>

        <Card style={styles.bookCard}>
          <TouchableOpacity style={styles.bookBtnLarge} onPress={() => setShowBooking(!showBooking)} activeOpacity={0.7}>
            <View style={styles.bookBtnContent}>
              <View style={[styles.bookIcon, { backgroundColor: Colors.primaryBg }]}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.bookTitle}>Book an Appointment</Text>
                <Text style={styles.bookSubtitle}>Find specialists and book your visit</Text>
              </View>
            </View>
            <Ionicons name={showBooking ? 'chevron-up' : 'chevron-down'} size={22} color={Colors.textMuted} />
          </TouchableOpacity>

          {showBooking && (
            <View style={styles.bookingForm}>
              <Text style={styles.fieldLabel}>Search Doctor</Text>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name, specialization..." />

              <View style={styles.doctorList}>
                {filteredDoctors.length === 0 ? (
                  <Text style={styles.noData}>No doctors available</Text>
                ) : (
                  filteredDoctors.map((d) => (
                    <TouchableOpacity
                      key={d.uid}
                      style={[styles.doctorItem, selectedDoctor?.uid === d.uid && styles.doctorItemSelected]}
                      onPress={() => setSelectedDoctor(d)}
                      activeOpacity={0.7}
                    >
                      <Avatar name={d.fullName} size="md" />
                      <View style={styles.doctorItemInfo}>
                        <Text style={styles.doctorItemName}>Dr. {d.fullName}</Text>
                        <Text style={styles.doctorItemSpec}>{d.specialization}</Text>
                        <Text style={styles.doctorItemHospital}>{d.hospital} • {d.experience} yrs exp.</Text>
                      </View>
                      <View style={[styles.radio, selectedDoctor?.uid === d.uid && styles.radioSelected]}>
                        {selectedDoctor?.uid === d.uid && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {selectedDoctor && (
                <>
                  <Text style={styles.fieldLabel}>Date</Text>
                  {Platform.OS === 'web' ? (
                    <View style={styles.selector}>
                      <input type="date" value={formatDate(date)} onChange={(e) => setDate(new Date(e.target.value))} style={styles.webDateInput} />
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                      <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                      <Text style={styles.selectorText}>{date.toDateString()}</Text>
                    </TouchableOpacity>
                  )}
                  {showDatePicker && (
                    <DateTimePicker value={date} mode="date" minimumDate={new Date()} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, selected) => { setShowDatePicker(false); if (event.type === 'set' && selected) setDate(selected) }} />
                  )}

                  <Text style={styles.fieldLabel}>Time</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((slot) => (
                      <TouchableOpacity key={slot} style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]} onPress={() => setSelectedTime(slot)} activeOpacity={0.7}>
                        <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input label="Reason for Visit" icon="chatbubble-ellipses-outline" value={reason} onChangeText={setReason} placeholder="e.g. Regular checkup, fever, etc." multiline numberOfLines={3} />

                  <Button title="Confirm Booking" onPress={handleBookAppointment} loading={submitting} style={{ marginTop: Spacing.sm }} />
                </>
              )}
            </View>
          )}
        </Card>

        <SectionHeader title="My Appointments" count={appointments.length} />

        {sortedAppointments.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No Appointments" message="Book your first appointment above" actionLabel="Book Now" onAction={() => setShowBooking(true)} />
        ) : (
          sortedAppointments.map((a, index) => (
            <Card key={a.id} style={styles.apptCard}>
              <View style={styles.apptHeader}>
                <View style={styles.apptDocRow}>
                  <Avatar name={a.doctorName} size="md" />
                  <View style={styles.apptDocInfo}>
                    <Text style={styles.apptDoctor}>Dr. {a.doctorName}</Text>
                    <Text style={styles.apptSpec}>{a.specialization}</Text>
                  </View>
                </View>
                <Badge status={a.status === 'confirmed' ? 'accepted' : a.status} />
              </View>
              <View style={styles.apptDivider} />
              <View style={styles.apptBody}>
                <View style={styles.apptDetailRow}>
                  <Ionicons name="medical-outline" size={15} color={Colors.primary} />
                  <Text style={styles.apptDetailText}>{a.hospital}</Text>
                </View>
                <View style={styles.apptDetailRow}>
                  <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                  <Text style={styles.apptDetailText}>{a.appointmentDate}</Text>
                </View>
                <View style={styles.apptDetailRow}>
                  <Ionicons name="time-outline" size={15} color={Colors.primary} />
                  <Text style={styles.apptDetailText}>{a.appointmentTime}</Text>
                </View>
                {a.reason ? (
                  <View style={styles.apptDetailRow}>
                    <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.textMuted} />
                    <Text style={[styles.apptDetailText, styles.apptReason]}>{a.reason}</Text>
                  </View>
                ) : null}
              </View>
              {(a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed') && (
                <TouchableOpacity onPress={() => handleCancelAppointment(a)} style={styles.cancelRow}>
                  <Ionicons name="close-circle-outline" size={18} color={Colors.danger} />
                  <Text style={styles.cancelText}>Cancel Appointment</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmAction.visible}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((p) => ({ ...p, visible: false }))}
        variant="danger"
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  welcomeCard: {
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
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeName: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: 2,
  },
  welcomeRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bookCard: {
    marginBottom: Spacing.lg,
  },
  bookBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bookIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  bookSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bookingForm: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  doctorList: { maxHeight: 300 },
  noData: { textAlign: 'center', color: Colors.textMuted, padding: Spacing.lg },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  doctorItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  doctorItemInfo: { flex: 1, marginLeft: Spacing.md },
  doctorItemName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  doctorItemSpec: { fontSize: 13, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  doctorItemHospital: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundAlt, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  selectorText: { fontSize: 15, color: Colors.text, fontWeight: '500', flex: 1 },
  webDateInput: { borderWidth: 0, backgroundColor: 'transparent', fontSize: 15, color: Colors.text, width: '100%', padding: Spacing.sm },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeSlot: { backgroundColor: Colors.backgroundAlt, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, width: '30%', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  timeSlotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  timeSlotTextActive: { color: Colors.surface },
  apptCard: { marginBottom: Spacing.md },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  apptDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  apptDocInfo: {
    flex: 1,
  },
  apptDoctor: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  apptSpec: {
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
  apptDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  apptDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  apptReason: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
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
