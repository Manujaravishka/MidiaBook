import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../context/ThemeContext'
import { subscribeActiveDoctors } from '../../services/doctorService'
import { DoctorProfile } from '../../types'
import { Spacing, BorderRadius } from '../../constants/theme'
import { Card, SearchBar, Avatar, EmptyState } from '../../components/ui'
import DoctorProfileModal from './doctor-profile'

const PAGE_SIZE = 10

interface Props {
  onNavigate?: (tab: 'home' | 'doctors' | 'appointments' | 'profile') => void
}

export default function DoctorsScreen({ onNavigate }: Props) {
  const { colors } = useTheme()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [page, setPage] = useState(1)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [fadeAnim])

  useEffect(() => {
    const unsub = subscribeActiveDoctors(setDoctors)
    return unsub
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSpecialization])

  const specializations = useMemo(() => {
    const specs = new Set(doctors.map((d) => d.specialization).filter(Boolean))
    return Array.from(specs)
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    let list = doctors
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization?.toLowerCase().includes(q) ||
          d.hospital?.toLowerCase().includes(q)
      )
    }
    if (selectedSpecialization) {
      list = list.filter((d) => d.specialization === selectedSpecialization)
    }
    return list
  }, [doctors, searchQuery, selectedSpecialization])

  const displayedDoctors = useMemo(() => {
    return filteredDoctors.slice(0, page * PAGE_SIZE)
  }, [filteredDoctors, page])

  const hasMore = displayedDoctors.length < filteredDoctors.length

  const handleViewProfile = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    setShowProfile(true)
  }

  const handleBookAppointment = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    setShowProfile(true)
  }

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setPage((p) => p + 1)
    }
  }, [hasMore])

  const renderDoctorCard = useCallback(({ item: d, index }: { item: DoctorProfile; index: number }) => (
    <Card style={[styles.docCard, { borderColor: colors.borderLight }]}>
      <View style={styles.docRow}>
        <Avatar name={d.fullName} size="lg" />
        <View style={styles.docInfo}>
          <Text style={[styles.docName, { color: colors.text }]}>Dr. {d.fullName}</Text>
          <View style={styles.specRow}>
            <Ionicons name="medical-outline" size={13} color={colors.primary} />
            <Text style={[styles.docSpec, { color: colors.primary }]}>{d.specialization}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="home-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.docMeta, { color: colors.textMuted }]}>{d.hospital}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.docMeta, { color: colors.textMuted }]}>{d.experience} years experience</Text>
          </View>
          {d.qualification && (
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.docMeta, { color: colors.textMuted }]}>{d.qualification}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
      </View>
      <View style={[styles.docActions, { borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primaryBg }]}
          onPress={() => handleViewProfile(d)}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleBookAppointment(d)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={16} color="#FFF" />
          <Text style={[styles.actionText, { color: '#FFF' }]}>Book</Text>
        </TouchableOpacity>
      </View>
    </Card>
  ), [colors])

  const renderFooter = () => {
    if (!hasMore) return <View style={{ height: 24 }} />
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Loading more doctors...</Text>
      </View>
    )
  }

  const renderEmpty = () => (
    <EmptyState
      icon="medical-outline"
      title="No Doctors Found"
      message={searchQuery ? 'Try a different search term' : 'No doctors available at the moment'}
    />
  )

  const headerComponent = (
    <View>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Find Doctors</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {doctors.length} specialists available
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, specialization, hospital..."
        />
      </View>

      {specializations.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
          data={['', ...specializations]}
          keyExtractor={(item) => item || '__all'}
          renderItem={({ item: spec }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                { borderColor: colors.border },
                !selectedSpecialization && !spec && { backgroundColor: colors.primary, borderColor: colors.primary },
                selectedSpecialization === spec && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedSpecialization(spec || null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  (!selectedSpecialization && !spec || selectedSpecialization === spec) && { color: '#FFF' },
                ]}
              >
                {spec || 'All'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={displayedDoctors}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.uid}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={7}
        />
      </Animated.View>

      {selectedDoctor && (
        <DoctorProfileModal
          visible={showProfile}
          doctor={selectedDoctor}
          onClose={() => setShowProfile(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: Spacing.md },
  chipScroll: { maxHeight: 44, marginTop: Spacing.sm },
  chipContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingBottom: Spacing.xl },
  docCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderWidth: 1 },
  docRow: { flexDirection: 'row' },
  docInfo: { flex: 1, marginLeft: Spacing.md },
  docName: { fontSize: 17, fontWeight: '700' },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  docSpec: { fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  docMeta: { fontSize: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  docActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.lg },
  actionText: { fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.lg },
  footerText: { fontSize: 13 },
})
