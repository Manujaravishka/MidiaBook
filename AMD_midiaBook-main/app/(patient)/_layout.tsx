import { useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import BottomNav from '../../components/ui/BottomNav'
import HomeScreen from './index'
import DoctorsScreen from './doctors'
import AppointmentsScreen from './appointments'
import ProfileScreen from './profile'

type TabKey = 'home' | 'doctors' | 'appointments' | 'profile'

export default function PatientLayout() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<TabKey>('home')

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
  }, [])

  if (!user) return null

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleTabChange} />
      case 'doctors':
        return <DoctorsScreen onNavigate={handleTabChange} />
      case 'appointments':
        return <AppointmentsScreen />
      case 'profile':
        return <ProfileScreen />
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
