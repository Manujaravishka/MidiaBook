import { useState, useCallback } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'
import { Container, Card, Input, Button } from '../../components/ui'
import { registerPatient } from '../../services/authService'

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!email.trim()) e.email = 'Email is required'
    if (!password.trim()) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    if (!confirmPassword.trim()) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [fullName, email, password, confirmPassword])

  const handleRegister = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await registerPatient(email.trim(), password, fullName.trim())
      Alert.alert('Account Created', 'You can now sign in.', [
        { text: 'Go to Login', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, password, fullName, validate, router])

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: '' }))

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join MediBook to start managing your health
            </Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full Name"
              icon="person-outline"
              value={fullName}
              onChangeText={(v) => { setFullName(v); clearError('fullName') }}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.fullName}
            />

            <Input
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={(v) => { setEmail(v); clearError('email') }}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={(v) => { setPassword(v); clearError('password') }}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              error={errors.password}
              isPassword
            />

            <Input
              label="Confirm Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword') }}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              isPassword
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.bodySmall,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
})
