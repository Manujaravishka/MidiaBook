import { useState, useCallback } from 'react'
import { View, Text, ScrollView, Modal, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { bookAppointment } from '../../services/appointmentService'
import { DoctorProfile } from '../../types'
import { Spacing, BorderRadius } from '../../constants/theme'
import { Avatar, Button } from '../../components/ui'

interface Props {
  visible: boolean
  doctor: DoctorProfile
  onClose: () => void
}

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
]

export default function DoctorProfileModal({ visible, doctor, onClose }: Props) {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [date] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleBook = useCallback(async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in')
    if (!selectedTime || !reason.trim()) {
      return Alert.alert('Missing Fields', 'Please select a time and provide a reason')
    }
    setSubmitting(true)
    try {
      const success = await bookAppointment(
        user.uid, user.fullName, user.email,
        doctor.uid, doctor.fullName, doctor.email,
        doctor.specialization || '', doctor.hospital || '',
        formatDate(date), selectedTime, reason.trim()
      )
      if (!success) {
        return Alert.alert('Unavailable', 'This time slot is already booked.')
      }
      Alert.alert('Success', `Appointment booked with Dr. ${doctor.fullName}!`)
      setSelectedTime(null)
      setReason('')
      onClose()
    } catch {
      Alert.alert('Error', 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }, [user, doctor, selectedTime, reason, date, onClose])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.profileHeader}>
              <Avatar name={doctor.fullName} size="xl" />
              <Text style={[styles.name, { color: colors.text }]}>Dr. {doctor.fullName}</Text>
              <View style={[styles.specBadge, { backgroundColor: colors.primaryBg }]}>
                <Ionicons name="medical-outline" size={14} color={colors.primary} />
                <Text style={[styles.specText, { color: colors.primary }]}>{doctor.specialization}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                <Ionicons name="home-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Hospital</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{doctor.hospital || 'N/A'}</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Experience</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{doctor.experience} years</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                <Ionicons name="school-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Qualification</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{doctor.qualification || 'N/A'}</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                <Ionicons name="mail-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{doctor.email}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Book Appointment</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Select Date</Text>
            <TouchableOpacity style={[styles.selector, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.selectorText, { color: colors.text }]}>{date.toDateString()}</Text>
            </TouchableOpacity>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Select Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlot, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }, selectedTime === slot && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setSelectedTime(slot)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeSlotText, { color: selectedTime === slot ? '#FFF' : colors.textSecondary }]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Reason for Visit</Text>
            <View style={[styles.reasonBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.reasonInput, { color: colors.text }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Why are you visiting today?"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <Button
              title="Confirm Booking"
              onPress={handleBook}
              loading={submitting}
              disabled={!selectedTime || !reason.trim()}
              style={{ marginTop: Spacing.md }}
            />

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl + 8,
    borderTopRightRadius: BorderRadius.xl + 8,
    maxHeight: '90%',
  },
  handleRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  name: { fontSize: 22, fontWeight: '800', marginTop: Spacing.md },
  specBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  specText: { fontSize: 14, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  infoItem: { width: '48%', borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 4 },
  infoLabel: { fontSize: 11, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.md },
  selector: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1 },
  selectorText: { fontSize: 15, fontWeight: '500', flex: 1 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeSlot: { paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, width: '30%', alignItems: 'center', borderWidth: 1 },
  timeSlotText: { fontSize: 12, fontWeight: '600' },
  reasonBox: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, minHeight: 50 },
  reasonInput: { flex: 1, fontSize: 15, minHeight: 30, paddingTop: 0 },
  closeBtn: { alignItems: 'center', paddingVertical: Spacing.lg },
  closeBtnText: { fontSize: 15, fontWeight: '600' },
})
