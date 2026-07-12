import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/theme'

export default function SplashScreen() {
  const router = useRouter()

  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoFade = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const textFade = useRef(new Animated.Value(0)).current
  const subtitleFade = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const iconFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(iconFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start()

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    )
    pulse.start()

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    )
    float.start()

    const timer = setTimeout(() => {
      router.replace('/(auth)/login')
    }, 2800)

    return () => {
      pulse.stop()
      float.stop()
      clearTimeout(timer)
    }
  }, [router, logoScale, logoFade, pulseAnim, textFade, subtitleFade, floatAnim, iconFade])

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })
  const pulseScale = pulseAnim

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#15803D', '#16A34A', '#22C55E']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.floatingIcon1,
            { opacity: iconFade, transform: [{ translateY: floatY }] },
          ]}
        >
          <Ionicons name="pulse" size={28} color="rgba(255,255,255,0.2)" />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingIcon2,
            {
              opacity: iconFade,
              transform: [{
                translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }),
              }],
            },
          ]}
        >
          <Ionicons name="medkit" size={24} color="rgba(255,255,255,0.15)" />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingIcon3,
            {
              opacity: iconFade,
              transform: [{
                translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }),
              }],
            },
          ]}
        >
          <Ionicons name="heart-half" size={22} color="rgba(255,255,255,0.18)" />
        </Animated.View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: pulseScale }] },
            ]}
          >
            <View style={styles.pulseRingInner} />
          </Animated.View>

          <Animated.View
            style={[
              styles.logoOuter,
              {
                opacity: logoFade,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoInner}>
              <Ionicons name="medical" size={44} color={Colors.surface} />
            </View>
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: textFade }]}>
            HealthCare
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
            Your Trusted Medical Partner
          </Animated.Text>

          <Animated.View style={[styles.loadingRow, { opacity: subtitleFade }]}>
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
            <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.version, { opacity: subtitleFade }]}>
          v1.0.0
        </Animated.Text>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIcon1: {
    position: 'absolute',
    top: '18%',
    right: '20%',
  },
  floatingIcon2: {
    position: 'absolute',
    top: '25%',
    left: '15%',
  },
  floatingIcon3: {
    position: 'absolute',
    bottom: '28%',
    right: '22%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.surface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 1.5,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 36,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  loadingDotDelay1: {
    opacity: 0.7,
  },
  loadingDotDelay2: {
    opacity: 0.4,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
    letterSpacing: 1,
  },
})
