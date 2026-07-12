import { useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme'
import Button from '../../components/ui/Button'

const { width } = Dimensions.get('window')

export default function CoverPage() {
  const router = useRouter()

  const handleGetStarted = useCallback(() => {
    router.push('/(auth)/login')
  }, [router])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#6366F1', '#818CF8']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Ionicons name="medical" size={40} color={Colors.surface} />
            </View>
          </View>

          <Text style={styles.badge}>Healthcare Simplified</Text>

          <Text style={styles.title}>
            Your Health,{'\n'}Our Priority
          </Text>

          <Text style={styles.subtitle}>
            Book appointments with trusted specialists,{'\n'}
            manage your health records, and stay on top of your wellness journey.
          </Text>

          <View style={styles.features}>
            <FeatureRow icon="calendar" text="Easy Appointment Booking" />
            <FeatureRow icon="people" text="Find Top Specialists" />
            <FeatureRow icon="shield-checkmark" text="Secure Health Records" />
          </View>

          <View style={styles.buttonArea}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.button}
            />
            <Text style={styles.footerText}>
              Join thousands of patients managing their health
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

function FeatureRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={16} color={Colors.surface} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 80,
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 120,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: '30%',
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.surface,
    lineHeight: 50,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  features: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
    alignSelf: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  buttonArea: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  button: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    height: 56,
    width: width - 64,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
})
