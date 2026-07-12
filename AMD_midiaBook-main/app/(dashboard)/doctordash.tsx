import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { db } from '../../services/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  AppointmentCard,
  SectionHeader,
  EmptyState,
  Avatar,
  LoadingScreen,
  Button,
} from '../../components/ui'

type Appointment = {
  id: string
  patientName: string
  doctorName: string
  speciality: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

type Stat = { icon: keyof typeof Ionicons.glyphMap; label: string; value: string | number; color: string; bg: string }

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const loadAppointments = useCallback(async () => {
    if (!user?.fullName) return
    setLoading(true)
    try {
      const snap = await getDocs(
        query(collection(db, 'appointments'), where('doctorName', '==', user.fullName))
      )
      const list: Appointment[] = []
      snap.forEach((d: any) => {
        const data = d.data()
        list.push({ id: d.id, ...data } as Appointment)
      })
      setAppointments(list)
    } catch {
      Alert.alert('Error', 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [user?.fullName])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter((a) => a.date === today)
  const pendingAppointments = appointments.filter((a) => a.status === 'pending')

  const stats: Stat[] = [
    { icon: 'calendar', label: "Today's Appointments", value: todayAppointments.length, color: Colors.primary, bg: Colors.primaryBg },
    { icon: 'time', label: 'Pending Requests', value: pendingAppointments.length, color: Colors.accent, bg: Colors.accentBg },
    { icon: 'checkmark-circle', label: 'Total Appointments', value: appointments.length, color: Colors.success, bg: Colors.successBg },
  ]

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Header
          title={`Dr. ${user?.fullName || 'Doctor'}`}
          subtitle="Doctor Dashboard"
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon} size={18} color={Colors.surface} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader
          title="All Appointments"
          count={appointments.length}
        />

        {loading ? (
          <LoadingScreen message="Loading appointments..." />
        ) : sortedAppointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Appointments"
            message="Appointments will appear here once patients book"
          />
        ) : (
          sortedAppointments.map((a) => (
            <AppointmentCard
              key={a.id}
              doctorName={a.patientName}
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
})
