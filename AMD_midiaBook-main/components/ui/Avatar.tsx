import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/theme'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  size?: AvatarSize
  color?: string
}

const sizeMap = {
  sm: { size: 32, font: 12 },
  md: { size: 44, font: 16 },
  lg: { size: 56, font: 22 },
  xl: { size: 72, font: 28 },
}

export default function Avatar({ name, size = 'md', color }: AvatarProps) {
  const dims = sizeMap[size]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const bgColor = color || getColorFromName(name)

  return (
    <View
      style={[
        styles.avatar,
        { width: dims.size, height: dims.size, borderRadius: dims.size / 3, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.text, { fontSize: dims.font }]}>{initials}</Text>
    </View>
  )
}

function getColorFromName(name: string): string {
  const colors = [
    '#16A34A', '#0F172A', '#14B8A6', '#2563EB',
    '#7C3AED', '#DC2626', '#D97706', '#0891B2',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.surface,
    fontWeight: '700',
  },
})
