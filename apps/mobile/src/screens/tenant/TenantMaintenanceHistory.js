import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar
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

const BLUE = COLORS.tenantPrimary;
const GOLD = COLORS.goldAccent;

export default function TenantMaintenanceHistory({ navigation }) {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get(API_ROUTES.MAINTENANCE);
      setRequests(res.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchRequests();
  }, [fetchRequests]));

  if (loading) return <LoadingScreen color={BLUE} />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* White header */}
      <View style={s.header}>
        <Text style={s.pageTitle}>Maintenance</Text>
      </View>

      {/* New request button */}
      <View style={s.btnWrap}>
        <TouchableOpacity
          style={s.newBtn}
          onPress={() => navigation.navigate('TenantMaintenanceRequest')}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.newBtnText}>NEW MAINTENANCE REQUEST</Text>
        </TouchableOpacity>
      </View>

      {/* Section divider */}
      <View style={s.sectionRow}>
        <Text style={s.sectionLabel}>HISTORY</Text>
        <View style={s.sectionLine} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={i => String(i.request_id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRequests(); }}
            tintColor={BLUE}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="construct-outline"
            title="No requests yet"
            message="Tap the button above to submit a maintenance request."
            iconColor={BLUE}
            iconBg="#EBF4FF"
          />
        }
        renderItem={({ item }) => {
          const isDone = item.status === 'completed';
          return (
            <View style={s.card}>
              <View style={s.statusIcon}>
                <Ionicons
                  name={isDone ? 'checkmark-circle' : 'time-outline'}
                  size={22}
                  color={isDone ? COLORS.landlordPrimary : '#E07B39'}
                />
              </View>
              <View style={s.cardBody}>
                <Text style={s.subject} numberOfLines={1}>{item.subject}</Text>
                <Text style={s.meta}>
                  {formatDate(item.report_date, 'medium')} · {categoryLabel(item.issue_category)}
                </Text>
                {item.status === 'completed' && item.resolved_date && (
                  <Text style={s.resolved}>
                    Resolved {formatDate(item.resolved_date, 'medium')}
                  </Text>
                )}
              </View>
              <StatusBadge status={item.status} />
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
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  pageTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  btnWrap:   { paddingHorizontal: 20, paddingVertical: 14 },
  newBtn: {
    height: 52, borderRadius: 999, backgroundColor: BLUE,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  newBtnText:  { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1.5 },
  sectionLine: { flex: 1, height: 1.5, backgroundColor: GOLD, opacity: 0.4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statusIcon: { width: 32, alignItems: 'center' },
  cardBody:   { flex: 1 },
  subject:    { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  meta:       { fontSize: 12, color: COLORS.textSecondary },
  resolved:   { fontSize: 11, color: COLORS.landlordPrimary, fontWeight: '600', marginTop: 2 },
});
