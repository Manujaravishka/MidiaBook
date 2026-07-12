import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { db } from '../../services/firebase'
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Button,
  DoctorCard,
  AppointmentCard,
  TimeSlotPicker,
  SectionHeader,
  Avatar,
  EmptyState,
  LoadingScreen,
} from '../../components/ui'

type Doctor = { id: string; fullName: string; speciality: string }
type Appointment = {
  id: string
  patientName?: string
  doctorId?: string
  doctorName: string
  speciality: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PatientDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const patientName = user?.fullName

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [showDoctorList, setShowDoctorList] = useState(false)
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [time, setTime] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState({ doctors: false, appointments: false })

  const loadDoctors = useCallback(async () => {
    setLoading((p) => ({ ...p, doctors: true }))
    try {
      const snap = await getDocs(collection(db, 'users'))
      const list: Doctor[] = []
      snap.forEach((d: any) => {
        const data = d.data()
        if (data.role === 'doctor') {
          list.push({ id: d.id, fullName: data.fullName, speciality: data.speciality || 'General' })
        }
      })
      setDoctors(list)
    } catch {
      Alert.alert('Error', 'Unable to load doctors')
    } finally {
      setLoading((p) => ({ ...p, doctors: false }))
    }
  }, [])

  const loadAppointments = useCallback(async () => {
    if (!patientName) return
    setLoading((p) => ({ ...p, appointments: true }))
    try {
      const snap = await getDocs(
        query(collection(db, 'appointments'), where('patientName', '==', patientName))
      )
      const list: Appointment[] = []
      snap.forEach((d: any) => {
        const data = d.data()
        list.push({ id: d.id, ...data } as Appointment)
      })
      setAppointments(list)
    } catch {
      Alert.alert('Error', 'Unable to load appointments')
    } finally {
      setLoading((p) => ({ ...p, appointments: false }))
    }
  }, [patientName])

  useEffect(() => { loadDoctors() }, [loadDoctors])
  useEffect(() => { loadAppointments() }, [loadAppointments])

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId),
    [doctors, selectedDoctorId]
  )

  const handleSubmit = useCallback(async () => {
    if (!patientName) return Alert.alert('Error', 'Patient name missing!')
    if (!selectedDoctorId || !date || !time) {
      return Alert.alert('Missing Fields', 'Please select doctor, date, and time.')
    }
    const doctor = doctors.find((d) => d.id === selectedDoctorId)
    if (!doctor) return Alert.alert('Error', 'Doctor not found')

    setSubmitting(true)
    try {
      const conflictQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', selectedDoctorId),
        where('date', '==', formatDate(date)),
        where('time', '==', time)
      )
      const snap = await getDocs(conflictQuery)
      if (!snap.empty) {
        Alert.alert('Unavailable', 'This time slot is already booked.')
        setSubmitting(false)
        return
      }

      const newApp: Omit<Appointment, 'id'> & { createdAt: Date } = {
        patientName,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        speciality: doctor.speciality,
        date: formatDate(date),
        time,
        status: 'pending',
        createdAt: new Date(),
      }

      const docRef = await addDoc(collection(db, 'appointments'), newApp)
      Alert.alert('Success', 'Appointment booked successfully!')
      setSelectedDoctorId('')
      setTime(null)
      setDate(new Date())
      setAppointments((prev) => [...prev, { id: docRef.id, ...newApp }])
    } catch {
      Alert.alert('Error', 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }, [patientName, selectedDoctorId, date, time, doctors])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const confirmCancel = useCallback(() => {
    setSelectedDoctorId('')
    setTime(null)
    setShowDoctorList(false)
  }, [])

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title={patientName || 'Patient'}
          subtitle="Welcome back,"
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        <Card style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.bookingTitle}>Book an Appointment</Text>
          </View>

          <Text style={styles.fieldLabel}>Select Specialist</Text>
          <TouchableOpacity
            onPress={() => setShowDoctorList(!showDoctorList)}
            style={styles.selector}
            activeOpacity={0.7}
          >
            <View style={styles.selectorLeft}>
              <Ionicons name="medical-outline" size={18} color={Colors.primary} />
              <Text style={[styles.selectorText, !selectedDoctor && styles.placeholder]}>
                {selectedDoctor ? `Dr. ${selectedDoctor.fullName}` : 'Choose a doctor...'}
              </Text>
            </View>
            <Ionicons name={showDoctorList ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {showDoctorList && (
            <View style={styles.doctorList}>
              {loading.doctors ? (
                <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.lg }} />
              ) : doctors.length === 0 ? (
                <Text style={styles.noData}>No doctors available</Text>
              ) : (
                doctors.map((d) => (
                  <DoctorCard
                    key={d.id}
                    id={d.id}
                    fullName={d.fullName}
                    speciality={d.speciality}
                    selected={d.id === selectedDoctorId}
                    onSelect={(id) => { setSelectedDoctorId(id); setShowDoctorList(false) }}
                  />
                ))
              )}
            </View>
          )}

          <Text style={styles.fieldLabel}>Appointment Date</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.selector}>
              <input
                type="date"
                value={formatDate(date)}
                onChange={(e) => setDate(new Date(e.target.value))}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.selector}
              activeOpacity={0.7}
            >
              <View style={styles.selectorLeft}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.selectorText}>
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                setShowDatePicker(false)
                if (event.type === 'set' && selected) setDate(selected)
              }}
            />
          )}

          <Text style={styles.fieldLabel}>Available Time Slots</Text>
          <TimeSlotPicker
            selected={time}
            onSelect={(t) => setTime(t)}
          />

          <Button
            title="Confirm Booking"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.bookButton}
          />
        </Card>

        <SectionHeader title="My Appointments" count={appointments.length} />

        {loading.appointments ? (
          <LoadingScreen message="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Appointments Yet"
            message="Book your first appointment above"
          />
        ) : (
          appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              doctorName={a.doctorName}
              speciality={a.speciality}
              date={a.date}
              time={a.time}
              status={a.status}
            />
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  bookingCard: {
    marginBottom: Spacing.lg,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  bookingTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectorText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  placeholder: {
    color: Colors.textMuted,
  },
  doctorList: {
    marginTop: Spacing.sm,
    maxHeight: 280,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    padding: Spacing.xs,
  },
  noData: {
    ...Typography.bodySmall,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  webDateInput: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: Colors.text,
    width: '100%',
    padding: Spacing.sm,
  },
  bookButton: {
    marginTop: Spacing.lg,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
})
