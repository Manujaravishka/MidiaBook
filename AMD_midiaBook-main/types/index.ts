export type UserRole = 'admin' | 'doctor' | 'patient'
export type AccountStatus = 'active' | 'inactive' | 'deleted'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface UserData {
  uid: string
  fullName: string
  email: string
  role: UserRole
  phone?: string
  gender?: string
  specialization?: string
  hospital?: string
  experience?: number
  qualification?: string
  profileImage?: string
  accountStatus: AccountStatus
  createdAt: Date
}

export interface DoctorProfile extends UserData {
  role: 'doctor'
  specialization: string
  hospital: string
  experience: number
  qualification: string
}

export interface PatientProfile extends UserData {
  role: 'patient'
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  doctorId: string
  doctorName: string
  doctorEmail: string
  specialization: string
  hospital: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: AppointmentStatus
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalDoctors: number
  totalPatients: number
  todayAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  cancelledAppointments: number
}

export interface AuthContextType {
  user: UserData | null
  loading: boolean
  logout: () => Promise<void>
}
