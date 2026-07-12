import React, { createContext, useEffect, useState, useContext, useCallback, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { router } from 'expo-router'
import { UserData, AuthContextType } from '../types'
import { checkAndCreateAdmin } from '../services/adminService'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const adminCheckDone = useRef(false)

  useEffect(() => {
    let mounted = true

    const setup = async () => {
      if (!adminCheckDone.current) {
        adminCheckDone.current = true
        try {
          await checkAndCreateAdmin()
        } catch {
          // silent
        }
      }
    }
    setup()

    const unsub = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser && mounted) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            if (data.accountStatus === 'deleted' || data.accountStatus === 'inactive') {
              setUser(null)
              await signOut(auth)
            } else {
              setUser({ uid: firebaseUser.uid, ...data } as UserData)
            }
          } else {
            setUser(null)
            await signOut(auth)
          }
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      unsub()
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.replace('/(auth)/login')
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
