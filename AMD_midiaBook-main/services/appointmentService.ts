import { db } from './firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { Appointment, AppointmentStatus } from '../types'

export const bookAppointment = async (
  patientId: string,
  patientName: string,
  patientEmail: string,
  doctorId: string,
  doctorName: string,
  doctorEmail: string,
  specialization: string,
  hospital: string,
  appointmentDate: string,
  appointmentTime: string,
  reason: string
): Promise<boolean> => {
  const conflictQuery = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId),
    where('appointmentDate', '==', appointmentDate),
    where('appointmentTime', '==', appointmentTime),
    where('status', 'in', ['pending', 'confirmed', 'accepted'])
  )
  const conflictSnap = await getDocs(conflictQuery)
  if (!conflictSnap.empty) return false

  await addDoc(collection(db, 'appointments'), {
    patientId,
    patientName,
    patientEmail,
    doctorId,
    doctorName,
    doctorEmail,
    specialization,
    hospital,
    appointmentDate,
    appointmentTime,
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return true
}

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export const subscribePatientAppointments = (
  patientId: string,
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId)
  )
  return onSnapshot(q, (snap: any) => {
    const list: Appointment[] = []
    snap.forEach((d: any) => list.push({ id: d.id, ...d.data() } as Appointment))
    callback(list)
  }, (err: any) => {
    console.error('subscribePatientAppointments error:', err)
  })
}

export const subscribeDoctorAppointments = (
  doctorId: string,
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId)
  )
  return onSnapshot(q, (snap: any) => {
    const list: Appointment[] = []
    snap.forEach((d: any) => list.push({ id: d.id, ...d.data() } as Appointment))
    callback(list)
  }, (err: any) => {
    console.error('subscribeDoctorAppointments error:', err)
  })
}

export const subscribeAllAppointments = (
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(collection(db, 'appointments'))
  return onSnapshot(q, (snap: any) => {
    const list: Appointment[] = []
    snap.forEach((d: any) => list.push({ id: d.id, ...d.data() } as Appointment))
    callback(list)
  }, (err: any) => {
    console.error('subscribeAllAppointments error:', err)
  })
}

export const isTimeSlotAvailable = async (
  doctorId: string,
  date: string,
  time: string
): Promise<boolean> => {
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId),
    where('appointmentDate', '==', date),
    where('appointmentTime', '==', time),
    where('status', 'in', ['pending', 'confirmed', 'accepted'])
  )
  const snap = await getDocs(q)
  return snap.empty
}
