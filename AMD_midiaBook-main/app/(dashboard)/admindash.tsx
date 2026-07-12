import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { db, auth } from '../../services/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import {
  Container,
  Header,
  Card,
  Input,
  Button,
  SectionHeader,
  Avatar,
  EmptyState,
  LoadingScreen,
} from '../../components/ui'

type Doctor = {
  id: string
  fullName: string
  speciality: string
  age: number
  email: string
  role: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      const docs: Doctor[] = []
      snap.forEach((d: any) => {
        const data = d.data()
        if (data.role === 'doctor') {
          docs.push({ id: d.id, ...data } as Doctor)
        }
      })
      setDoctors(docs)
    } catch {
      Alert.alert('Error', 'Failed to load doctors.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  const handleAddDoctor = useCallback(async () => {
    if (!fullName || !speciality || !age || !email || !password) {
      return Alert.alert('Missing Fields', 'Please fill all doctor details.')
    }
    setAdding(true)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      await addDoc(collection(db, 'users'), {
        fullName,
        speciality,
        age: Number(age),
        email,
        role: 'doctor',
        uid: userCred.user.uid,
      })
      Alert.alert('Success', 'Doctor added successfully!')
      setFullName('')
      setSpeciality('')
      setAge('')
      setEmail('')
      setPassword('')
      setShowForm(false)
      fetchDoctors()
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'This email is already registered.')
      } else {
        Alert.alert('Error', err.message || 'Failed to add doctor.')
      }
    } finally {
      setAdding(false)
    }
  }, [fullName, speciality, age, email, password, fetchDoctors])

  const handleLogout = useCallback(async () => {
    await logout()
    router.replace('/(auth)/login')
  }, [logout, router])

  const resetForm = useCallback(() => {
    setFullName('')
    setSpeciality('')
    setAge('')
    setEmail('')
    setPassword('')
    setShowForm(false)
  }, [])

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title={user?.fullName || 'Administrator'}
          subtitle="Admin Dashboard"
          rightAction={{ icon: 'log-out-outline', onPress: handleLogout, color: Colors.danger }}
        />

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{doctors.length}</Text>
              <Text style={styles.statLabel}>Registered Doctors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <SectionHeader title="Doctor Management" count={doctors.length} />
          <Button
            title={showForm ? 'Cancel' : 'Add Doctor'}
            onPress={() => setShowForm(!showForm)}
            variant={showForm ? 'ghost' : 'primary'}
            fullWidth={false}
            style={styles.addButton}
          />
        </View>

        {showForm && (
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="person-add" size={22} color={Colors.primary} />
              <Text style={styles.formTitle}>Register New Doctor</Text>
            </View>

            <Input
              label="Full Name"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Dr. John Smith"
            />

            <Input
              label="Speciality"
              icon="medical-outline"
              value={speciality}
              onChangeText={setSpeciality}
              placeholder="e.g. Cardiologist"
            />

            <View style={styles.inlineFields}>
              <View style={styles.halfField}>
                <Input
                  label="Age"
                  icon="calendar-outline"
                  value={age}
                  onChangeText={setAge}
                  placeholder="35"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="doctor@clinic.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <Input
              label="Initial Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Temporary password"
              isPassword
            />

            <View style={styles.formActions}>
              <Button title="Register Doctor" onPress={handleAddDoctor} loading={adding} style={styles.formButton} />
              <Button title="Cancel" onPress={resetForm} variant="ghost" style={styles.formButton} />
            </View>
          </Card>
        )}

        {loading ? (
          <LoadingScreen message="Loading doctors..." />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Doctors Registered"
            message="Add your first doctor to get started"
            actionLabel="Add Doctor"
            onAction={() => setShowForm(true)}
          />
        ) : (
          doctors.map((item) => (
            <View key={item.id} style={styles.doctorCard}>
              <Avatar name={item.fullName} size="md" />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Dr. {item.fullName}</Text>
                <Text style={styles.docSpec}>{item.speciality}</Text>
                <Text style={styles.docDetail}>{item.email} • {item.age} yrs</Text>
              </View>
              <View style={styles.docStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
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
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 'auto',
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  formTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  formActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formButton: {
    marginTop: 0,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  docInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  docName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  docSpec: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  docDetail: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  docStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
})
