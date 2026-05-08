import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Image, RefreshControl, StatusBar, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_ROUTES, formatPeso } from '@upahan/shared';
import api, { BASE_URL } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const FILTERS = [
  { label: 'ALL',        value: '' },
  { label: 'STUDIO',     value: 'Studio' },
  { label: '1 BEDROOM',  value: '1 Bedroom' },
  { label: '2 BEDROOM',  value: '2 Bedroom' },
  { label: 'UNDER ₱10K', value: 'under10k' },
  { label: 'UNDER ₱20K', value: 'under20k' },
];

export default function GuestUnits({ navigation }) {
  const [units, setUnits]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [activeFilter, setFilter]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUnits = async () => {
    try {
      const res = await api.get(API_ROUTES.UNITS);
      setUnits(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchUnits(); }, []);

  useEffect(() => {
    let result = [...units];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.unit_code?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.floor_plan?.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'under10k')      result = result.filter(u => u.monthly_price < 10000);
    else if (activeFilter === 'under20k') result = result.filter(u => u.monthly_price < 20000);
    else if (activeFilter)                result = result.filter(u => u.floor_plan?.includes(activeFilter));
    setFiltered(result);
  }, [search, activeFilter, units]);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.unit_id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchUnits(); }}
            tintColor={TEAL}
          />
        }
        ListHeaderComponent={
          <>
            {/* Teal header — full bleed */}
            <View style={s.header}>
              <TouchableOpacity
                style={s.backRow}
                onPress={() => navigation.navigate('RoleSelect')}
              >
                <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={s.backText}>Back</Text>
              </TouchableOpacity>
              <View style={s.brandRow}>
                <Ionicons name="home" size={16} color="#fff" />
                <Text style={s.brand}>UPAHAN</Text>
              </View>
              <Text style={s.heroTitle}>Available Units</Text>
              <Text style={s.heroSub}>Zambales Properties for Rent</Text>
            </View>

            {/* Search bar */}
            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={18} color={TEAL} style={{ marginRight: 10 }} />
              <TextInput
                style={s.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search units, location…"
                placeholderTextColor={COLORS.textMuted}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={[s.filterChip, activeFilter === f.value && s.filterChipActive]}
                  onPress={() => setFilter(f.value)}
                >
                  <Text style={[s.filterChipText, activeFilter === f.value && s.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="home-outline" title="No Units Available" message="Try adjusting your search or filters." />
        }
        renderItem={({ item }) => {
          const photo = item.unit_photos?.[0] || item.photos?.[0];
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('GuestUnitDetail', { unitId: item.unit_id })}
              activeOpacity={0.88}
            >
              <View style={s.photoWrap}>
                {photo ? (
                  <Image source={{ uri: photo.startsWith('http') ? photo : `${BASE_URL}${photo}` }} style={s.photo} />
                ) : (
                  <View style={[s.photo, s.photoPlaceholder]}>
                    <Ionicons name="home-outline" size={40} color="rgba(74,74,74,0.15)" />
                  </View>
                )}
                {item.floor_plan && (
                  <View style={s.floorBadge}>
                    <Text style={s.floorBadgeText}>{item.floor_plan.split(',')[0].trim()}</Text>
                  </View>
                )}
                <View style={s.priceOverlay}>
                  <Text style={s.priceOverlayAmount}>{formatPeso(item.monthly_price)}</Text>
                  <Text style={s.priceOverlayMo}>/mo</Text>
                </View>
              </View>
              <View style={s.cardBody}>
                <Text style={s.unitCode}>Unit {item.unit_code}</Text>
                {item.location && (
                  <View style={s.locationRow}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={s.location} numberOfLines={1}>{item.location}</Text>
                  </View>
                )}
                <Text style={s.cardMeta} numberOfLines={1}>
                  {[item.bedrooms, item.floor_plan].filter(Boolean).join(' · ') || 'Unit details available'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pageBg },
  header: {
    backgroundColor: TEAL, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    marginHorizontal: -20,
  },
  backRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  brand:    { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  heroTitle:{ fontSize: 28, fontWeight: '700', fontFamily: 'serif', color: '#fff', marginBottom: 4 },
  heroSub:  { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, height: 52, paddingHorizontal: 14,
    marginTop: 16, marginBottom: 12,
    shadowColor: TEAL, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterRow:   { marginBottom: 16 },
  filterChip: {
    height: 34, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: TEAL, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  filterChipActive:     { backgroundColor: TEAL, borderColor: TEAL },
  filterChipText:       { fontSize: 12, fontWeight: '700', color: TEAL },
  filterChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  photoWrap:       { position: 'relative' },
  photo:           { width: '100%', height: 200 },
  photoPlaceholder:{ backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  floorBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: TEAL, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  floorBadgeText:     { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  priceOverlay: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  priceOverlayAmount: { fontSize: 16, fontWeight: '700', fontFamily: 'serif', color: TEAL },
  priceOverlayMo:     { fontSize: 11, color: COLORS.textSecondary },
  cardBody:    { padding: 14 },
  unitCode:    { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  location:    { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  cardMeta:    { fontSize: 12, color: COLORS.textSecondary },
});
