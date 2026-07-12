import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import Avatar from './Avatar'

interface DoctorCardProps {
  id: string
  fullName: string
  speciality: string
  selected?: boolean
  onSelect: (id: string) => void
}

function DoctorCard({ id, fullName, speciality, selected, onSelect }: DoctorCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
      style={[styles.card, selected && styles.selected]}
    >
      <Avatar name={fullName} size="md" />
      <View style={styles.info}>
        <Text style={styles.name}>Dr. {fullName}</Text>
        <Text style={styles.spec}>{speciality}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  )
}

export default memo(DoctorCard)

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  spec: {
    ...Typography.caption,
    marginTop: 2,
    color: Colors.primary,
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
})
