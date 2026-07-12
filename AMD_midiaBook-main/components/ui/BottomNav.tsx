import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { BorderRadius, Spacing } from '../../constants/theme'

type TabKey = 'home' | 'doctors' | 'appointments' | 'profile'

interface TabItem {
  key: TabKey
  label: string
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
}

const tabs: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'doctors', label: 'Doctors', icon: 'people-outline', activeIcon: 'people' },
  { key: 'appointments', label: 'Appointments', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
]

interface BottomNavProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && { backgroundColor: colors.primaryBg }]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={26}
                color={isActive ? colors.primary : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textMuted },
                isActive && { fontWeight: '800' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
})
