import { auth, db } from './firebase'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { UserData, DoctorProfile, DashboardStats } from '../types'

const ADMIN_EMAIL = 'admin@hospital.com'
const ADMIN_PASSWORD = 'Admin@123'

export const checkAndCreateAdmin = async (): Promise<void> => {
  const q = query(collection(db, 'users'), where('role', '==', 'admin'))
  const snap = await getDocs(q)

  if (!snap.empty) return

  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      fullName: 'System Administrator',
      email: ADMIN_EMAIL,
      role: 'admin',
      accountStatus: 'active',
      createdAt: serverTimestamp(),
    })
    await signOut(auth)
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') return
    console.error('Admin creation failed:', err)
  }
}

export const addDoctor = async (
  fullName: string,
  email: string,
  password: string,
  phone: string,
  gender: string,
  specialization: string,
  hospital: string,
  experience: string,
  qualification: string
): Promise<void> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    fullName,
    email,
    phone,
    gender,
    specialization,
    hospital,
    experience: Number(experience),
    qualification,
    role: 'doctor',
    accountStatus: 'active',
    profileImage: '',
    createdAt: serverTimestamp(),
  })
  await signOut(auth)
}

export const updateDoctor = async (uid: string, data: Partial<DoctorProfile>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data)
}

export const toggleDoctorStatus = async (uid: string, currentStatus: string): Promise<void> => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  await updateDoc(doc(db, 'users', uid), { accountStatus: newStatus })
}

export const subscribeDoctors = (
  callback: (doctors: DoctorProfile[]) => void
): (() => void) => {
  const q = query(collection(db, 'users'), where('role', '==', 'doctor'))
  return onSnapshot(q, (snap: any) => {
    const list: DoctorProfile[] = []
    snap.forEach((d: any) => {
      const data = d.data() as DoctorProfile
      if (data.accountStatus !== 'deleted') list.push({ ...data, uid: d.id })
    })
    callback(list)
  })
}

export const subscribeStats = (
  callback: (stats: DashboardStats) => void
): (() => void) => {
  const today = new Date().toISOString().split('T')[0]
  const todayStr = today

  return onSnapshot(collection(db, 'users'), (snap: any) => {
    let totalDoctors = 0
    let totalPatients = 0
    snap.forEach((d: any) => {
      const data = d.data()
      if (data.role === 'doctor' && data.accountStatus !== 'deleted') totalDoctors++
      if (data.role === 'patient') totalPatients++
    })

    const unsubToday = onSnapshot(
      query(collection(db, 'appointments'), where('appointmentDate', '==', todayStr)),
      (snap2: any) => {
        let todayAppointments = 0
        snap2.forEach(() => todayAppointments++)

        const unsubAll = onSnapshot(collection(db, 'appointments'), (snap3: any) => {
          let pending = 0
          let confirmed = 0
          let completed = 0
          let cancelled = 0
          snap3.forEach((d: any) => {
            const s = d.data().status
            if (s === 'pending') pending++
            else if (s === 'confirmed') confirmed++
            else if (s === 'completed') completed++
            else if (s === 'cancelled') cancelled++
          })
          callback({ totalDoctors, totalPatients, todayAppointments, pendingAppointments: pending, confirmedAppointments: confirmed, completedAppointments: completed, cancelledAppointments: cancelled })
        })
        return unsubAll
      }
    )
    return unsubToday
  })
}

export const subscribeRecentUsers = (
  callback: (users: UserData[]) => void
): (() => void) => {
  const q = query(collection(db, 'users'))
  return onSnapshot(q, (snap: any) => {
    const list: UserData[] = []
    snap.forEach((d: any) => {
      const data = d.data() as UserData
      list.push({ ...data, uid: d.id })
    })
    list.sort((a, b) => {
      const aTime = (a.createdAt as unknown as Timestamp)?.toMillis?.() || 0
      const bTime = (b.createdAt as unknown as Timestamp)?.toMillis?.() || 0
      return bTime - aTime
    })
    callback(list.slice(0, 5))
  })
}
