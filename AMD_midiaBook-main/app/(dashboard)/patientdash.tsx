import { useEffect } from 'react'
import PatientLayout from '../(patient)/_layout'

export default function PatientDashboard() {
  useEffect(() => {
    console.log('[RENDER] PatientDashboard → rendering PatientLayout from app/(patient)/_layout.tsx')
  }, [])
  return <PatientLayout />
}
