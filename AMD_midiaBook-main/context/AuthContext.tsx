import React, { createContext, useEffect, useState, useContext, useCallback } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { router } from 'expo-router'

export interface UserData {
  uid: string
  email: string
  fullName: string
  role: 'admin' | 'doctor' | 'patient'
  speciality?: string
  age?: number
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            setUser({
              uid: firebaseUser.uid,
              email: data.email || '',
              fullName: data.fullName || '',
              role: data.role || 'patient',
              speciality: data.speciality,
              age: data.age,
            })
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.replace('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
