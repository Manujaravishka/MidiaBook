import { db } from './firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { DoctorProfile } from '../types'

export const subscribeActiveDoctors = (
  callback: (doctors: DoctorProfile[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'doctor'),
    where('accountStatus', '==', 'active')
  )
  return onSnapshot(q, (snap: any) => {
    const list: DoctorProfile[] = []
    snap.forEach((d: any) => {
      list.push({ uid: d.id, ...d.data() } as DoctorProfile)
    })
    callback(list)
  })
}
