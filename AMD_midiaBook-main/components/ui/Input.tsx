import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  icon?: keyof typeof Ionicons.glyphMap
  error?: string
  hint?: string
  isPassword?: boolean
}

export default function Input({
  label,
  icon,
  error,
  hint,
  isPassword,
  value,
  onChangeText,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [secure, setSecure] = useState(isPassword)

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.focused,
          error && styles.errorBorder,
          props.multiline && styles.multiline,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? Colors.danger : focused ? Colors.primary : Colors.textMuted}
            style={[styles.icon, props.multiline && { marginTop: 2 }]}
          />
        )}
        <TextInput
          style={[styles.input, props.multiline && styles.multilineInput, style as any]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.toggle}>
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    color: Colors.text,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  multiline: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  focused: {
    borderColor: Colors.primary,
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: 52,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  toggle: {
    padding: Spacing.xs,
  },
  error: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  hint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
})
