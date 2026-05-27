import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES } from '@upahan/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();

  const intervalRef = useRef(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [unitsRes, pendingPayRes, pendingMaintRes] = await Promise.all([
        api.get(API_ROUTES.UNITS),
        api.get(API_ROUTES.PAYMENT_PENDING),
        api.get(API_ROUTES.MAINTENANCE_PENDING),
      ]);
      const units = unitsRes.data.data || [];
      setStats({
        total:           units.length,
        occupied:        units.filter(u => u.vacancy_status === 'occupied').length,
        pendingPayments: pendingPayRes.data.data?.length ?? 0,
        pendingMaint:    pendingMaintRes.data.data?.length ?? 0,
      });
    } catch {}
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchStats(false);
    intervalRef.current = setInterval(() => fetchStats(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStats]));

  // Derived display values
  const userName       = user?.first_name || user?.name || 'Admin';
  const totalUnits     = stats?.total    ?? 0;
  const occupiedUnits  = stats?.occupied ?? 0;
  const collectionPct  = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const pendingFixes   = stats?.pendingMaint    ?? 0;
  const pendingPayments = stats?.pendingPayments ?? 0;
  const monthYear      = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekStart  = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekDays   = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchStats(true); }}
            tintColor={TEAL}
          />
        }
      >
        {/* TEAL HEADER */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <View style={s.logoRow}>
              <Ionicons name="home" size={22} color="#fff" />
              <Text style={s.brand}>UPAHAN</Text>
            </View>
            <Text style={s.brandSub}>RGT REAL ESTATE MARKETING</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={TEAL} style={{ marginTop: 60 }} size="large" />
        ) : (
          <>
            {/* RENT COLLECTION CARD */}
            <View style={s.rentCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.rentLabel}>RENT COLLECTION</Text>
                <View style={s.inProgressBadge}>
                  <Text style={s.inProgressText}>IN PROGRESS</Text>
                </View>
              </View>
              <Text style={s.rentPct}>{collectionPct}%</Text>
              <Text style={s.rentSubLabel}>COLLECTED THIS MONTH — {monthYear.toUpperCase()}</Text>
              <Text style={s.rentUnits}>{occupiedUnits}/{totalUnits} units paid</Text>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${collectionPct}%` }]} />
              </View>
            </View>

            {/* QUICK ACTIONS — 2 cards */}
            <View style={s.actionsRow}>
              <TouchableOpacity
                style={s.actionCard}
                onPress={() => navigation.navigate('Units', { screen: 'AdminRegisterUnit' })}
                activeOpacity={0.85}
              >
                <View style={s.actionIconTeal}>
                  <Ionicons name="add" size={28} color={TEAL} />
                </View>
                <Text style={s.actionLabel}>ADD NEW UNIT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.actionCard}
                onPress={() => navigation.navigate('Fixes')}
                activeOpacity={0.85}
              >
                {pendingFixes > 0 && (
                  <View style={s.actionBadge}>
                    <Text style={s.actionBadgeText}>{pendingFixes}</Text>
                  </View>
                )}
                <View style={s.actionIconAmber}>
                  <Ionicons name="construct" size={24} color="#E67E22" />
                </View>
                <Text style={s.actionLabel}>FIX REQUESTS</Text>
                {pendingFixes > 0 && (
                  <Text style={s.actionSubLabel}>{pendingFixes} pending</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* PAYMENT REQUESTS — icon-card */}
            <TouchableOpacity
              style={s.paymentCard}
              onPress={() => navigation.navigate('Payments')}
              activeOpacity={0.85}
            >
              <View style={s.paymentIconCircle}>
                <Ionicons name="card-outline" size={20} color={TEAL} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={s.paymentCardTitle}>PAYMENT REQUESTS</Text>
                <Text style={[s.paymentCardSub, pendingPayments > 0 && { color: '#E67E22' }]}>
                  {pendingPayments} pending review
                </Text>
              </View>
              {pendingPayments > 0 && (
                <View style={s.payCountBadge}>
                  <Text style={s.payCountText}>{pendingPayments}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* CALENDAR */}
            <Text style={s.calLabel}>CALENDAR</Text>
            <View style={s.calCard}>
              <Text style={s.calMonthText}>{monthLabel}</Text>
              <View style={s.calDayHeaders}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <Text key={d} style={s.calDayHeader}>{d}</Text>
                ))}
              </View>
              <View style={s.calGrid}>
                {weekDays.map((d, i) => {
                  const isToday = d.toDateString() === now.toDateString();
                  return (
                    <View key={i} style={s.calCell}>
                      <View style={[s.calDayCircle, isToday && s.calToday]}>
                        <Text style={[s.calDayText, isToday && s.calTodayText]}>{d.getDate()}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pageBg },
  header: {
    backgroundColor: TEAL,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand:    { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  brandSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginTop: 3 },

  rentCard: {
    backgroundColor: TEAL, borderRadius: 16,
    marginHorizontal: 16, marginTop: 16, padding: 16,
    shadowColor: TEAL, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  rentLabel:    { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  inProgressBadge: { backgroundColor: '#F0CF6A', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  inProgressText:  { fontSize: 10, fontWeight: '700', color: '#277571', textTransform: 'uppercase', letterSpacing: 0.8 },
  rentPct:      { fontSize: 44, fontWeight: '700', color: '#fff', marginTop: 8, fontFamily: 'Inter_700Bold' },
  rentSubLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 2 },
  rentUnits:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 10 },
  progressBg:   { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },

  actionsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    alignItems: 'center', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  actionIconTeal: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionIconAmber: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel:    { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', letterSpacing: 0.5 },
  actionSubLabel: { fontSize: 11, color: '#E67E22', marginTop: 4, textAlign: 'center' },
  actionBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: COLORS.dangerPrimary, borderRadius: 999, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  actionBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  paymentCard: {
    backgroundColor: '#FFF', borderRadius: 12,
    marginHorizontal: 16, marginTop: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  paymentIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center',
  },
  paymentCardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.8 },
  paymentCardSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  payCountBadge: {
    backgroundColor: TEAL, borderRadius: 999, minWidth: 26, height: 26,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  payCountText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  calLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: GOLD,
    marginHorizontal: 16, marginTop: 20, marginBottom: 8,
  },
  calCard: {
    backgroundColor: '#FFF', borderRadius: 12, marginHorizontal: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    marginBottom: 8,
  },
  calMonthText:  { fontSize: 15, fontWeight: '700', color: TEAL, textAlign: 'center', marginBottom: 12 },
  calDayHeaders: { flexDirection: 'row', marginBottom: 4 },
  calDayHeader:  { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#888' },
  calGrid:       { flexDirection: 'row' },
  calCell:       { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calDayCircle:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  calToday:      { backgroundColor: TEAL },
  calDayText:    { fontSize: 13, color: COLORS.textPrimary },
  calTodayText:  { color: '#FFF', fontWeight: '700' },
});
