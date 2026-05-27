import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatPeso } from '@upahan/shared';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const AVATAR_COLORS = ['#277571', '#4A90D9', '#E67E22', '#8E44AD', '#C0392B'];
const FILTERS = ['all', 'vacant', 'occupied'];

export default function AdminUnitList({ navigation }) {
  const [units, setUnits]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [activeFilter, setActive] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef(null);

  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(API_ROUTES.UNITS);
      setUnits(res.data.data || []);
    } catch {}
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchUnits(false);
    intervalRef.current = setInterval(() => fetchUnits(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnits]));

  React.useEffect(() => {
    let data = units;
    if (activeFilter !== 'all') data = data.filter(u => u.vacancy_status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.unit_code?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [units, activeFilter, search]);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      {/* Teal header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Unit List</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AdminRegisterUnit')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={TEAL} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by unit code or location…"
            placeholderTextColor={COLORS.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, activeFilter === f && s.chipActive]}
            onPress={() => setActive(f)}
          >
            <Text style={[s.chipText, activeFilter === f && s.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.unit_id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchUnits(true); }}
            tintColor={TEAL}
          />
        }
        ListEmptyComponent={<EmptyState icon="business-outline" title="No units found" />}
        renderItem={({ item, index }) => {
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = item.unit_code?.slice(0, 2).toUpperCase() || '??';
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('AdminUnitDetail', { unitId: item.unit_id })}
              activeOpacity={0.85}
            >
              <View style={[s.unitAvatar, { backgroundColor: avatarColor }]}>
                <Text style={s.unitAvatarText}>{initials}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.unitCode}>Unit {item.unit_code}</Text>
                <Text style={s.tenantName}>
                  {item.tenant_name || 'No tenant assigned'}
                </Text>
                {item.location ? (
                  <Text style={s.location} numberOfLines={1}>{item.location}</Text>
                ) : null}
              </View>
              <View style={s.cardRight}>
                <Text style={s.price}>{formatPeso(item.monthly_price)}</Text>
                <StatusBadge status={item.vacancy_status} />
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.borderLight} style={{ marginLeft: 4 }} />
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: TEAL, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  headerLabel: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#fff' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40, height: 40, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 52, backgroundColor: COLORS.inputBg, borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterRow:  { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: TEAL, backgroundColor: '#fff' },
  chipActive:     { backgroundColor: TEAL, borderColor: TEAL },
  chipText:       { fontSize: 11, fontWeight: '600', color: TEAL },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  unitAvatar:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  unitAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  cardBody:   { flex: 1, gap: 2 },
  cardRight:  { alignItems: 'flex-end', gap: 4 },
  unitCode:   { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  tenantName: { fontSize: 13, color: COLORS.textSecondary },
  location:   { fontSize: 11, color: COLORS.textMuted },
  price:      { fontSize: 13, fontWeight: '700', color: TEAL, fontFamily: 'Inter_700Bold' },
});
