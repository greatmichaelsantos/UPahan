import React, { useState, useCallback } from 'react';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatPeso, formatDate, formatMonthYear } from '@upahan/shared';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const BLUE   = COLORS.tenantPrimary;
const TEAL   = COLORS.landlordPrimary;
const GOLD   = COLORS.goldAccent;
const ORANGE = '#E07B39';

const STATUS_COLOR = {
  paid:             TEAL,
  partial:          BLUE,
  late:             COLORS.dangerPrimary,
  pending_approval: ORANGE,
  rejected:         COLORS.dangerPrimary,
  unpaid:           COLORS.dangerPrimary,
  advance:          TEAL,
};

export default function TenantPaymentHistory({ navigation }) {
  const [payments, setPayments]         = useState([]);
  const [declarations, setDeclarations] = useState([]);
  const [summary, setSummary]           = useState({ totalPaid: 0, totalPending: 0 });
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeTab, setActiveTab]       = useState('history');

  const fetchData = useCallback(async () => {
    try {
      const [pRes, sRes, dRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/summary'),
        api.get(API_ROUTES.PAYMENT_MY_DECLARATIONS),
      ]);
      setPayments(pRes.data.data || []);
      setSummary(sRes.data.data || { totalPaid: 0, totalPending: 0 });
      setDeclarations(dRes.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]));

  const groupByMonth = (items) => {
    const groups = {};
    items.forEach(p => {
      const key = p.month_covered || p.payment_date?.substring(0, 7) || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, data]) => ({ title: month, data }));
  };

  const getMonthStatus = (entries) => {
    const statuses = entries.map(e => e.payment_status);
    if (statuses.every(s => s === 'paid')) return 'paid';
    if (statuses.some(s => s === 'late')) return 'late';
    if (statuses.some(s => s === 'partial')) return 'partial';
    return entries[0]?.payment_status || 'unpaid';
  };

  const pendingCount = declarations.filter(d => d.payment_status === 'pending_approval').length;
  const grouped = groupByMonth(payments);

  if (loading) return <LoadingScreen color={BLUE} />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <Text style={s.pageTitle}>Payments</Text>
      </View>

      <SectionList
        sections={activeTab === 'history' ? grouped : [{ title: '', data: declarations }]}
        keyExtractor={(item, i) => String(item.payment_id ?? i)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={BLUE}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12, marginTop: 12 }}>
            {/* Summary card */}
            <View style={s.summaryCard}>
              <View style={s.summaryCol}>
                <Text style={s.summaryLabel}>PAID</Text>
                <Text style={[s.summaryAmount, { color: BLUE }]}>{formatPeso(summary.totalPaid)}</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={[s.summaryCol, { paddingLeft: 16 }]}>
                <Text style={s.summaryLabel}>PENDING</Text>
                <Text style={[s.summaryAmount, { color: ORANGE }]}>{formatPeso(summary.totalPending)}</Text>
              </View>
            </View>

            {/* Declare button */}
            <TouchableOpacity
              style={s.newDeclareBtn}
              onPress={() => navigation.navigate('TenantPaymentDeclare')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.newDeclareBtnText}>DECLARE PAYMENT</Text>
            </TouchableOpacity>

            {/* Tabs */}
            <View style={s.tabRow}>
              <TouchableOpacity
                style={[s.tab, activeTab === 'history' && s.tabActive]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>HISTORY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tab, activeTab === 'declarations' && s.tabActive]}
                onPress={() => setActiveTab('declarations')}
              >
                <Text style={[s.tabText, activeTab === 'declarations' && s.tabTextActive]}>MY DECLARATIONS</Text>
                {pendingCount > 0 && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="card-outline"
            title={activeTab === 'history' ? 'No Payments Recorded' : 'No Declarations Yet'}
            message={activeTab === 'history' ? 'Your verified payment history will appear here.' : 'Declarations you submit will appear here.'}
            iconColor={BLUE}
            iconBg="#EBF4FF"
          />
        }
        ListFooterComponent={
          <View style={s.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color={GOLD} />
            <Text style={s.disclaimerText}>
              Verified payments appear in History. Declarations you submit appear in My Declarations until the landlord approves or rejects them.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) =>
          activeTab === 'history' && section.title ? (
            <View style={s.monthHeader}>
              <Text style={s.monthTitle}>{formatMonthYear(section.title)}</Text>
              <StatusBadge status={getMonthStatus(section.data)} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const status = item.payment_status;
          const color  = STATUS_COLOR[status] || COLORS.textMuted;
          if (activeTab === 'history') {
            return (
              <View style={[s.payCard, { borderLeftColor: color }]}>
                <View style={s.payCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.payAmount, { color }]}>{formatPeso(item.amount)}</Text>
                    <Text style={s.payMeta}>
                      {item.payment_type === 'full' ? 'Full Payment' : item.payment_type === 'partial' ? 'Partial Payment' : 'Advance Payment'}
                      {item.payment_method ? ` · ${item.payment_method}` : ''}
                    </Text>
                  </View>
                  <StatusBadge status={status} />
                </View>
                <Text style={s.payDate}>{formatDate(item.payment_date, 'long')}</Text>
                {item.remaining_balance > 0 && (
                  <Text style={s.remaining}>Remaining balance: {formatPeso(item.remaining_balance)}</Text>
                )}
                {item.rejection_reason && (
                  <View style={s.rejectNote}>
                    <Text style={s.rejectText}>Not Verified: {item.rejection_reason}</Text>
                  </View>
                )}
              </View>
            );
          }
          return (
            <View style={[s.payCard, { borderLeftColor: color }]}>
              <View style={s.payCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.payAmount, { color }]}>{formatPeso(item.amount)}</Text>
                  <Text style={s.payMeta}>
                    {item.payment_type === 'full' ? 'Full' : 'Partial'}
                    {item.payment_method ? ` · ${item.payment_method}` : ''}
                    {item.reference_number ? ` · Ref: ${item.reference_number}` : ''}
                  </Text>
                </View>
                <StatusBadge status={status} />
              </View>
              <View style={s.declareGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={s.declareLabel}>Payment Date</Text>
                  <Text style={s.declareValue}>{formatDate(item.payment_date, 'medium')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.declareLabel}>Submitted</Text>
                  <Text style={s.declareValue}>{formatDate(item.created_at, 'medium')}</Text>
                </View>
              </View>
              {item.remaining_balance > 0 && (
                <Text style={s.remaining}>Remaining balance: {formatPeso(item.remaining_balance)}</Text>
              )}
              {status === 'rejected' && item.rejection_reason && (
                <View style={s.rejectNote}>
                  <Ionicons name="alert-circle-outline" size={14} color={COLORS.dangerPrimary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rejectText, { fontWeight: '700', marginBottom: 2 }]}>Rejection Reason</Text>
                    <Text style={s.rejectText}>{item.rejection_reason}</Text>
                  </View>
                </View>
              )}
              {status === 'pending_approval' && (
                <Text style={s.pendingNote}>Waiting for landlord review...</Text>
              )}
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
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  pageTitle: { flex: 1, fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  newDeclareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 8, backgroundColor: BLUE,
  },
  newDeclareBtnText: { fontSize: 14, fontWeight: '600', color: '#fff', fontFamily: 'Inter_700Bold' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  summaryCol:    { flex: 1 },
  summaryDivider:{ width: 1.5, height: 40, backgroundColor: GOLD, marginHorizontal: 16 },
  summaryLabel:  { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  summaryAmount: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1, height: 40, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.inputBg, flexDirection: 'row', gap: 6,
  },
  tabActive:     { backgroundColor: BLUE },
  tabText:       { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  badge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.dangerPrimary, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  monthHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8, marginTop: 4, paddingHorizontal: 2,
  },
  monthTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  payCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  payCardTop:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 12 },
  payAmount:   { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  payMeta:     { fontSize: 12, color: COLORS.textSecondary },
  payDate:     { fontSize: 12, color: COLORS.textMuted },
  remaining:   { fontSize: 12, color: BLUE, fontWeight: '600', marginTop: 4 },
  rejectNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 8, marginTop: 8,
  },
  rejectText:   { fontSize: 11, color: COLORS.dangerPrimary, lineHeight: 16 },
  pendingNote:  { fontSize: 12, color: ORANGE, fontStyle: 'italic', marginTop: 6 },
  declareGrid:  { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 4 },
  declareLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  declareValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.infoBannerBg, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.infoBannerBorder, marginTop: 4,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: COLORS.textPrimary, lineHeight: 18, fontStyle: 'italic' },
});
