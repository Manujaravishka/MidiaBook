import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, BorderRadius } from '../../constants/theme'
import { Avatar, Card, Button, Input } from '../../components/ui'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { colors, isDark, toggleTheme } = useTheme()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  const handleSave = useCallback(async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name cannot be empty')
    setSaving(true)
    try {
      // TODO: update user profile in Firestore
      await new Promise((r) => setTimeout(r, 500))
      Alert.alert('Success', 'Profile updated')
      setEditing(false)
    } catch {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }, [name])

  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ])
  }, [logout])

  if (!user) return null

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.profileSection}>
            <Avatar name={user.fullName} size="xl" />
            <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
            <Text style={[styles.role, { color: colors.primary }]}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</Text>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: colors.primaryBg, borderColor: colors.primary }]}
              onPress={() => setEditing(!editing)}
              activeOpacity={0.7}
            >
              <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={16} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

            {editing ? (
              <>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
                  <Input value={name} onChangeText={setName} placeholder="Your full name" />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Phone</Text>
                  <Input value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
                </View>
                <Button title="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: Spacing.md }} />
              </>
            ) : (
              <>
                <ProfileRow icon="person-outline" label="Name" value={user.fullName} colors={colors} />
                <ProfileRow icon="mail-outline" label="Email" value={user.email} colors={colors} />
                {user.phone && <ProfileRow icon="call-outline" label="Phone" value={user.phone} colors={colors} />}
                {user.gender && <ProfileRow icon="man-outline" label="Gender" value={user.gender} colors={colors} />}
              </>
            )}
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
            <TouchableOpacity style={styles.settingRow} onPress={toggleTheme} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingHint, { color: colors.textMuted }]}>
                    {isDark ? 'Dark theme active' : 'Light theme active'}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggle, isDark && { backgroundColor: colors.primary }]}>
                <View style={[styles.toggleCircle, isDark && { transform: [{ translateX: 20 }] }]} />
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.secondaryBg }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.secondary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.secondaryBg }]}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.secondary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.dangerBg }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.danger }]}>Logout</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

function ProfileRow({ icon, label, value, colors }: { icon: any; label: string; value: string; colors: any }) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <View style={styles.profileRowContent}>
        <Text style={[styles.profileRowLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.profileRowValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  profileSection: { alignItems: 'center', marginBottom: Spacing.lg },
  name: { fontSize: 22, fontWeight: '800', marginTop: Spacing.md },
  role: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, marginTop: Spacing.md },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  sectionCard: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  field: { marginBottom: Spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  profileRowContent: { flex: 1 },
  profileRowLabel: { fontSize: 12, fontWeight: '500' },
  profileRowValue: { fontSize: 15, fontWeight: '600', marginTop: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingHint: { fontSize: 12, marginTop: 1 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: '#CBD5E1', padding: 3, justifyContent: 'center' },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  version: { textAlign: 'center', fontSize: 12, marginTop: Spacing.lg },
})
