import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import Button from './Button'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button title={cancelLabel} onPress={onCancel} variant="ghost" fullWidth={false} style={styles.btn} />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              fullWidth={false}
              style={styles.btn}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 340,
    ...Shadows.lg,
  },
  title: {
    ...Typography.h4,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  btn: {
    minWidth: 100,
  },
})
