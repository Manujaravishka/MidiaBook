import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Animated, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { subscribeActiveDoctors } from '../../services/doctorService'
import { subscribePatientAppointments, bookAppointment, updateAppointmentStatus } from '../../services/appointmentService'
import { DoctorProfile, Appointment } from '../../types'
import { Button, Avatar, Badge, ConfirmDialog } from '../../components/ui'

interface Props {
  onNavigate: (tab: 'home' | 'doctors' | 'appointments' | 'profile') => void
}

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
]

export default function HomeScreen({ onNavigate }: Props) {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', onConfirm: () => {},
  })

  useEffect(() => {
    const unsubDocs = subscribeActiveDoctors(setDoctors)
    if (user?.uid) {
      const unsubApps = subscribePatientAppointments(user.uid, setAppointments)
      return () => { unsubDocs(); unsubApps() }
    }
    return unsubDocs
  }, [user?.uid])

  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleConfirmBooking = useCallback(async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in')
    if (!selectedDoctor) return Alert.alert('Error', 'Please select a doctor')
    if (!selectedTime) return Alert.alert('Error', 'Please select a time slot')
    if (!reason.trim()) return Alert.alert('Error', 'Please provide a reason for visit')

    setSubmitting(true)
    try {
      const success = await bookAppointment(
        user.uid, user.fullName, user.email,
        selectedDoctor.uid, selectedDoctor.fullName, selectedDoctor.email,
        selectedDoctor.specialization || '', selectedDoctor.hospital || '',
        formatDate(selectedDate), selectedTime, reason.trim()
      )
      if (!success) {
        return Alert.alert('Unavailable', 'This time slot is already booked.')
      }
      Alert.alert('Success', `Appointment booked with Dr. ${selectedDoctor.fullName}!`)
      setSelectedDoctor(null)
      setSelectedTime(null)
      setReason('')
      setSelectedDate(new Date())
    } catch {
      Alert.alert('Error', 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }, [user, selectedDoctor, selectedTime, reason, selectedDate])

  const handleCancelAppointment = useCallback((appointment: Appointment) => {
    setConfirmAction({
      visible: true,
      title: 'Cancel Appointment',
      message: `Cancel your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate}?`,
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

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors.slice(0, 5)
    const q = searchQuery.toLowerCase()
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q)
    )
  }, [doctors, searchQuery])

  const recentAppts = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'pending' || a.status === 'accepted' || a.status === 'confirmed')
      .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
      .slice(0, 3)
  }, [appointments])

  const changeDate = (days: number) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + days)
    setSelectedDate(next)
  }

  if (!user) return null

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => onNavigate('profile')} activeOpacity={0.7} style={styles.headerLeft}>
            <Avatar name={user.fullName} size="sm" />
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>Hello</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{user.fullName}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.primaryBg }]} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <View style={[styles.notifDot, { borderColor: colors.surface }]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        nestedScrollEnabled
      >
        {/* ──── DOCTOR LIST SECTION ──── */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="calendar" size={20} color="#16A34A" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Book an Appointment</Text>
        </View>

        <View style={[styles.searchRow, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search doctor by name, specialization..."
            placeholderTextColor={colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {filteredDoctors.length === 0 ? (
          <View style={styles.noDoctors}>
            <Ionicons name="medical-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.noDoctorsTitle, { color: colors.textSecondary }]}>
              {searchQuery ? 'No doctors match your search' : 'No doctors available'}
            </Text>
            <Text style={[styles.noDoctorsSub, { color: colors.textMuted }]}>
              {searchQuery ? 'Try a different search term' : 'Check back later'}
            </Text>
          </View>
        ) : (
          filteredDoctors.map((d, i) => (
            <DoctorCard
              key={d.uid}
              doctor={d}
              index={i}
              colors={colors}
              isSelected={selectedDoctor?.uid === d.uid}
              onSelect={setSelectedDoctor}
              onViewProfile={() => onNavigate('doctors')}
            />
          ))
        )}

        {doctors.length > 5 && (
          <TouchableOpacity
            style={[styles.viewAllBtn, { borderColor: colors.primary }]}
            onPress={() => onNavigate('doctors')}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllBtnText, { color: colors.primary }]}>View All Doctors</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* ──── BOOKING FORM (date + time + confirm) ──── */}
        {selectedDoctor && (
          <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.borderLight, marginTop: 28 }]}>
            <Text style={[styles.bookingCardTitle, { color: colors.text }]}>
              Booking with Dr. {selectedDoctor.fullName}
            </Text>

            {/* Date Selection */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Select Date</Text>
              <View style={[styles.dateRow, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow} activeOpacity={0.7}>
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.dateCenter}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={[styles.dateText, { color: colors.text }]}>{selectedDate.toDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Select Time</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                      selectedTime === slot && { backgroundColor: '#16A34A', borderColor: '#16A34A' },
                    ]}
                    onPress={() => setSelectedTime(slot)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      { color: selectedTime === slot ? '#FFF' : colors.textSecondary },
                    ]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reason Input */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Reason for Visit</Text>
              <View style={[styles.reasonRow, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.reasonInput, { color: colors.text }]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. General checkup, fever..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Confirm Button */}
            <Button
              title="Confirm Appointment"
              onPress={handleConfirmBooking}
              loading={submitting}
              disabled={!selectedTime || !reason.trim()}
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* ──── MY APPOINTMENTS SECTION ──── */}
        <View style={{ height: 48 }} />

        <View>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color="#16A34A" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Appointments</Text>
          </View>

          {recentAppts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 }}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="calendar-outline" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No appointments yet</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Book your first doctor appointment</Text>
                <Button title="Find a Doctor" onPress={() => onNavigate('doctors')} variant="secondary" style={{ marginTop: 14 }} />
              </View>
            </View>
          ) : (
            recentAppts.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                colors={colors}
                onCancel={handleCancelAppointment}
              />
            ))
          )}

          {appointments.length > 3 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderColor: colors.primary }]}
              onPress={() => onNavigate('appointments')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAllBtnText, { color: colors.primary }]}>View All Appointments</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

function DoctorCard({
  doctor,
  index,
  colors,
  isSelected,
  onSelect,
  onViewProfile,
}: {
  doctor: DoctorProfile
  index: number
  colors: any
  isSelected: boolean
  onSelect: (d: DoctorProfile | null) => void
  onViewProfile: () => void
}) {
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }).start()
  }, [])

  return (
    <Animated.View style={[styles.docCardOuter, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onSelect(isSelected ? null : doctor)}
        style={[
          styles.docCard,
          { backgroundColor: colors.surface, borderColor: isSelected ? '#16A34A' : colors.borderLight },
          isSelected && { borderWidth: 2 },
        ]}
      >
        <View style={styles.docCardTop}>
          <Avatar name={doctor.fullName} size="lg" />
          <View style={styles.docCardInfo}>
            <Text style={[styles.docCardName, { color: colors.text }]}>Dr. {doctor.fullName}</Text>
            <View style={styles.docCardChip}>
              <Ionicons name="medical-outline" size={12} color="#16A34A" />
              <Text style={[styles.docCardSpec, { color: '#16A34A' }]}>{doctor.specialization}</Text>
            </View>
            <View style={styles.docCardMeta}>
              <Ionicons name="home-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.docCardMetaText, { color: colors.textMuted }]}>{doctor.hospital}</Text>
            </View>
            <View style={styles.docCardMeta}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.docCardMetaText, { color: colors.textMuted }]}>{doctor.experience} years exp.</Text>
            </View>
          </View>
          {isSelected && (
            <View style={styles.docCardCheck}>
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            </View>
          )}
        </View>
        <View style={[styles.docCardDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.docCardActions}>
          <TouchableOpacity
            style={[styles.docCardProfileBtn, { borderColor: colors.primary }]}
            onPress={onViewProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={15} color={colors.primary} />
            <Text style={[styles.docCardProfileText, { color: colors.primary }]}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.docCardSelectBtn, { backgroundColor: isSelected ? colors.borderLight : '#16A34A' }]}
            onPress={() => onSelect(isSelected ? null : doctor)}
            activeOpacity={0.85}
          >
            <Ionicons name={isSelected ? 'close-outline' : 'calendar-outline'} size={15} color={isSelected ? colors.textSecondary : '#FFF'} />
            <Text style={[styles.docCardSelectText, { color: isSelected ? colors.textSecondary : '#FFF' }]}>
              {isSelected ? 'Remove' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

function AppointmentCard({
  appointment,
  colors,
  onCancel,
}: {
  appointment: Appointment
  colors: any
  onCancel: (a: Appointment) => void
}) {
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start()
  }, [])

  return (
    <Animated.View style={[styles.apptCardOuter, { transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={styles.apptCardTop}>
          <Avatar name={appointment.doctorName} size="md" />
          <View style={styles.apptCardInfo}>
            <Text style={[styles.apptCardDoctor, { color: colors.text }]}>Dr. {appointment.doctorName}</Text>
            <Text style={[styles.apptCardSpec, { color: colors.primary }]}>{appointment.specialization}</Text>
          </View>
          <Badge status={appointment.status === 'confirmed' ? 'accepted' : appointment.status} />
        </View>
        <View style={[styles.apptCardDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.apptCardDetails}>
          <View style={styles.apptCardRow}>
            <Ionicons name="home-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.apptCardText, { color: colors.textSecondary }]}>{appointment.hospital}</Text>
          </View>
          <View style={styles.apptCardRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.apptCardText, { color: colors.textSecondary }]}>{appointment.appointmentDate}</Text>
          </View>
          <View style={styles.apptCardRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.apptCardText, { color: colors.textSecondary }]}>{appointment.appointmentTime}</Text>
          </View>
        </View>
        {(appointment.status === 'pending' || appointment.status === 'accepted' || appointment.status === 'confirmed') && (
          <TouchableOpacity style={styles.apptCardCancel} onPress={() => onCancel(appointment)} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.apptCardCancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: { fontSize: 12, fontWeight: '500' },
  userName: { fontSize: 17, fontWeight: '700', marginTop: 1 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#DC2626', borderWidth: 1.5,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },

  noDoctors: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  noDoctorsTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  noDoctorsSub: { fontSize: 13, textAlign: 'center' },

  docCardOuter: { marginBottom: 14 },
  docCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  docCardTop: { flexDirection: 'row' },
  docCardInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  docCardName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  docCardChip: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  docCardSpec: { fontSize: 13, fontWeight: '600' },
  docCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  docCardMetaText: { fontSize: 12 },
  docCardCheck: { justifyContent: 'center', marginLeft: 8 },
  docCardDivider: { height: 1, marginVertical: 12 },
  docCardActions: { flexDirection: 'row', gap: 10 },
  docCardProfileBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5,
  },
  docCardProfileText: { fontSize: 13, fontWeight: '700' },
  docCardSelectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12,
  },
  docCardSelectText: { fontSize: 13, fontWeight: '700' },

  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, marginTop: 4,
  },
  viewAllBtnText: { fontSize: 14, fontWeight: '700' },

  bookingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
  },
  dateArrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '30%',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    borderWidth: 1,
  },
  reasonInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  emptyCard: {
    borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 12,
  },
  emptyIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13, textAlign: 'center' },

  apptCardOuter: { marginBottom: 14 },
  apptCard: {
    borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  apptCardTop: { flexDirection: 'row', alignItems: 'center' },
  apptCardInfo: { flex: 1, marginLeft: 12 },
  apptCardDoctor: { fontSize: 15, fontWeight: '700' },
  apptCardSpec: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  apptCardDivider: { height: 1, marginVertical: 10 },
  apptCardDetails: { gap: 6 },
  apptCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apptCardText: { fontSize: 13, flex: 1 },
  apptCardCancel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  apptCardCancelText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
})
