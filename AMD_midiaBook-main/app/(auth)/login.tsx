import { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme'
import { Input, Button } from '../../components/ui'
import { loginUser } from '../../services/authService'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const icon1Anim = useRef(new Animated.Value(0)).current
  const icon2Anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(icon1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(icon1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(icon2Anim, { toValue: 0, duration: 2500, useNativeDriver: true }),
        Animated.timing(icon2Anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start()
  }, [fadeAnim, slideAnim, icon1Anim, icon2Anim])

  const validate = useCallback(() => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    if (!password.trim()) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [email, password])

  const handleLogin = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const user = await loginUser(email.trim(), password)
      if (user.role === 'admin') router.replace('/(dashboard)/admindash')
      else if (user.role === 'doctor') router.replace('/(dashboard)/doctordash')
      else router.replace('/(dashboard)/patientdash')
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }, [email, password, validate, router])

  return (
    <View style={styles.root}>
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
            <Animated.View
              style={[
                styles.floatingIcon1,
                {
                  opacity: icon1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }),
                  transform: [{ translateY: icon1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) }],
                },
              ]}
            >
              <Ionicons name="pulse" size={24} color="rgba(255,255,255,0.3)" />
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcon2,
                {
                  opacity: icon2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }),
                  transform: [{ translateY: icon2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
                },
              ]}
            >
              <Ionicons name="medkit" size={20} color="rgba(255,255,255,0.25)" />
            </Animated.View>

            <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.logoWrap}>
                <View style={styles.logoInner}>
                  <Ionicons name="medical" size={36} color={Colors.surface} />
                </View>
              </View>
              <Text style={styles.brandName}>MediBook</Text>
              <Text style={styles.brandSub}>Hospital Management System</Text>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.formSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.signInText}>Sign in to your account</Text>

              <Input
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="doctor@hospital.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email}
              />

              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })) }}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                error={errors.password}
                isPassword
              />

              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navyBg,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: Colors.navyBg,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingIcon1: {
    position: 'absolute',
    top: 80,
    right: 50,
  },
  floatingIcon2: {
    position: 'absolute',
    top: 100,
    left: 40,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    marginTop: -20,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeText: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  signInText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
})
