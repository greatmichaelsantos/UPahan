import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatDate, categoryLabel } from '@upahan/shared';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const PRIORITY_COLORS = { high: COLORS.dangerPrimary, medium: '#E07B39', low: COLORS.textMuted };
const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
];

export default function AdminMaintenanceList({ navigation }) {
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [activeFilter, setActive] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState(null);

  const intervalRef = useRef(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(API_ROUTES.MAINTENANCE);
      setRequests(res.data.data || []);
    } catch {}
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchRequests(false);
    intervalRef.current = setInterval(() => fetchRequests(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRequests]));

  React.useEffect(() => {
    setFiltered(
      activeFilter === 'all'
        ? requests
        : requests.filter(r => r.status === activeFilter)
    );
  }, [requests, activeFilter]);

  const handleResolve = (item) => {
    Alert.alert('Resolve Request', `Mark "${item.subject}" as resolved?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resolve',
        onPress: async () => {
          setResolving(item.request_id);
          try {
            await api.put(API_ROUTES.maintenanceById(item.request_id), { status: 'completed' });
            fetchRequests();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Update failed.');
          }
          setResolving(null);
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerLabel}>MAINTENANCE</Text>
          <Text style={s.headerTitle}>Fix Requests</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, activeFilter === f.key && s.chipActive]}
            onPress={() => setActive(f.key)}
          >
            <Text style={[s.chipText, activeFilter === f.key && s.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.request_id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRequests(true); }}
            tintColor={TEAL}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="construct-outline" title="No requests" message="No maintenance requests match this filter." />
        }
        renderItem={({ item }) => {
          const priorityColor = PRIORITY_COLORS[item.priority_level] || COLORS.textMuted;
          const isResolving   = resolving === item.request_id;
          return (
            <View style={s.card}>
              <View style={[s.priorityBar, { backgroundColor: priorityColor }]} />
              <View style={s.cardBody}>
                {/* Top row: unit badge + priority badge + status */}
                <View style={s.badgeRow}>
                  <View style={s.unitBadge}>
                    <Text style={s.unitBadgeText}>Unit {item.unit_code || '—'}</Text>
                  </View>
                  <View style={[s.priorityBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
                    <Text style={[s.priorityBadgeText, { color: priorityColor }]}>
                      {item.priority_level?.toUpperCase()}
                    </Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                {/* Subject */}
                <Text style={s.subject} numberOfLines={2}>{item.subject}</Text>
                <Text style={s.category}>{categoryLabel(item.issue_category)}</Text>

                {/* Tenant name + timestamp */}
                <View style={s.metaRow}>
                  {item.tenant_name ? (
                    <View style={s.tenantMeta}>
                      <Ionicons name="person-outline" size={12} color={COLORS.textSecondary} />
                      <Text style={s.metaText}>{item.tenant_name}</Text>
                    </View>
                  ) : null}
                  <Text style={s.dateText}>{formatDate(item.report_date, 'medium')}</Text>
                </View>

                {/* Action buttons */}
                {item.status !== 'completed' && (
                  <View style={s.cardActions}>
                    <TouchableOpacity
                      style={[s.resolveBtn, isResolving && { opacity: 0.5 }]}
                      onPress={() => handleResolve(item)}
                      disabled={isResolving}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color={TEAL} />
                      <Text style={s.resolveBtnText}>RESOLVED</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.detailBtn}
                      onPress={() => navigation.navigate('AdminMaintenanceDetail', { requestId: item.request_id })}
                    >
                      <Text style={s.detailBtnText}>DETAIL</Text>
                      <Ionicons name="chevron-forward" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {item.status === 'completed' && (
                  <TouchableOpacity
                    style={s.detailBtnFull}
                    onPress={() => navigation.navigate('AdminMaintenanceDetail', { requestId: item.request_id })}
                  >
                    <Text style={s.detailBtnText}>VIEW DETAIL</Text>
                    <Ionicons name="chevron-forward" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
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
  headerTitle: { fontSize: 28, fontWeight: '700', fontFamily: 'serif', color: '#fff' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  countText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: TEAL, backgroundColor: '#fff' },
  chipActive:     { backgroundColor: TEAL, borderColor: TEAL },
  chipText:       { fontSize: 11, fontWeight: '600', color: TEAL },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody:    { flex: 1, padding: 14, gap: 6 },
  badgeRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  unitBadge:   { backgroundColor: COLORS.landlordLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  unitBadgeText: { fontSize: 11, fontWeight: '700', color: TEAL },
  priorityBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  priorityBadgeText: { fontSize: 10, fontWeight: '700' },
  subject:   { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  category:  { fontSize: 12, color: COLORS.textSecondary },
  metaRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  tenantMeta:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: 12, color: COLORS.textSecondary },
  dateText:  { fontSize: 11, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  resolveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderWidth: 1.5, borderColor: TEAL, borderRadius: 999, paddingVertical: 9,
  },
  resolveBtnText: { fontSize: 12, fontWeight: '700', color: TEAL },
  detailBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: TEAL, borderRadius: 999, paddingVertical: 9,
  },
  detailBtnFull: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: TEAL, borderRadius: 999, paddingVertical: 9, marginTop: 8,
  },
  detailBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
