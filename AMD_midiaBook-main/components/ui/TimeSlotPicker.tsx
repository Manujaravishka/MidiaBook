import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
]

interface TimeSlotPickerProps {
  selected: string | null
  onSelect: (time: string) => void
}

function TimeSlotPicker({ selected, onSelect }: TimeSlotPickerProps) {
  return (
    <View style={styles.grid}>
      {TIME_SLOTS.map((slot) => (
        <TouchableOpacity
          key={slot}
          onPress={() => onSelect(slot)}
          activeOpacity={0.7}
          style={[styles.slot, selected === slot && styles.slotActive]}
        >
          <Text style={[styles.slotText, selected === slot && styles.slotTextActive]}>
            {slot}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default memo(TimeSlotPicker)

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  slot: {
    backgroundColor: Colors.backgroundAlt,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slotTextActive: {
    color: Colors.surface,
  },
})
