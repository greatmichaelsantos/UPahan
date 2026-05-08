import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatPeso, formatDate } from '@upahan/shared';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const TEAL   = COLORS.landlordPrimary;
const GOLD   = COLORS.goldAccent;
const ORANGE = '#E07B39';

const AVATAR_COLORS = ['#277571', '#4A90D9', '#E67E22', '#8E44AD', '#C0392B'];

export default function AdminPaymentRequests({ navigation }) {
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(null);

  const intervalRef = useRef(null);

  const fetchPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(API_ROUTES.PAYMENT_PENDING);
      setPayments(res.data.data || []);
    } catch {}
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchPayments(false);
    intervalRef.current = setInterval(() => fetchPayments(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPayments]));

  const handleApprove = payment => {
    Alert.alert('Approve Payment', `Approve ${formatPeso(payment.amount)} from ${payment.tenant_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setProcessing(payment.payment_id);
          try {
            await api.put(API_ROUTES.paymentApprove(payment.payment_id));
            fetchPayments();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Approval failed.');
          }
          setProcessing(null);
        },
      },
    ]);
  };

  const handleReject = payment => {
    Alert.alert('Reject Payment', `Reject ${formatPeso(payment.amount)} from ${payment.tenant_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          setProcessing(payment.payment_id);
          try {
            await api.put(API_ROUTES.paymentReject(payment.payment_id), { rejectionReason: 'Rejected by admin' });
            fetchPayments();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Rejection failed.');
          }
          setProcessing(null);
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
          <Text style={s.headerLabel}>FINANCE</Text>
          <Text style={s.headerTitle}>Payment Requests</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{payments.length}</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        keyExtractor={i => String(i.payment_id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchPayments(true); }}
            tintColor={TEAL}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="checkmark-circle-outline" title="All clear!" message="No pending payment approvals." />
        }
        renderItem={({ item, index }) => {
          const isProcessing  = processing === item.payment_id;
          const initials      = item.tenant_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
          const avatarColor   = AVATAR_COLORS[index % AVATAR_COLORS.length];
          return (
            <View style={s.card}>
              <View style={s.topBar} />
              <View style={s.cardInner}>
                {/* Top row: avatar + name + amount */}
                <View style={s.cardTop}>
                  <View style={[s.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={s.avatarText}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tenantName}>{item.tenant_name || 'Unknown'}</Text>
                    <Text style={s.unitMeta}>Unit {item.unit_code} · {item.month_covered}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.amount}>{formatPeso(item.amount)}</Text>
                    {item.monthly_price ? (
                      <Text style={s.amountSub}>of {formatPeso(item.monthly_price)} monthly</Text>
                    ) : null}
                  </View>
                </View>

                {/* Details grid */}
                <View style={s.detailsGrid}>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>TYPE</Text>
                    <Text style={s.detailValue}>{item.payment_type}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>METHOD</Text>
                    <Text style={s.detailValue}>{item.payment_method || 'N/A'}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>SUBMITTED</Text>
                    <Text style={s.detailValue}>{formatDate(item.payment_date, 'medium')}</Text>
                  </View>
                </View>
                {item.reference_number ? (
                  <View style={s.refRow}>
                    <Text style={s.refLabel}>REFERENCE</Text>
                    <Text style={s.refValue}>{item.reference_number}</Text>
                  </View>
                ) : null}
                <View style={s.monthRow}>
                  <Text style={s.refLabel}>MONTH COVERED</Text>
                  <Text style={s.refValue}>{item.month_covered}</Text>
                </View>

                {item.notes ? (
                  <Text style={s.notes} numberOfLines={2}>"{item.notes}"</Text>
                ) : null}

                {/* Action buttons — APPROVE left, REJECT right */}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={[s.approveBtn, isProcessing && { opacity: 0.5 }]}
                    onPress={() => handleApprove(item)}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={[s.btnLabel, { color: '#fff' }]}>APPROVE</Text>
                        </>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.rejectBtn, isProcessing && { opacity: 0.5 }]}
                    onPress={() => handleReject(item)}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? <ActivityIndicator size="small" color={COLORS.dangerPrimary} />
                      : <>
                          <Ionicons name="close" size={16} color={COLORS.dangerPrimary} />
                          <Text style={[s.btnLabel, { color: COLORS.dangerPrimary }]}>REJECT</Text>
                        </>}
                  </TouchableOpacity>
                </View>
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
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  topBar:     { height: 4, backgroundColor: ORANGE },
  cardInner:  { padding: 16 },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  tenantName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  unitMeta:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  amountSub:  { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2 },
  amount:     { fontSize: 18, fontWeight: '800', fontFamily: 'serif', color: COLORS.textPrimary },
  detailsGrid:{ flexDirection: 'row', gap: 12, marginBottom: 10 },
  detailItem: { flex: 1 },
  detailLabel:{ fontSize: 10, fontWeight: '700', color: GOLD, letterSpacing: 1, marginBottom: 2 },
  detailValue:{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, textTransform: 'capitalize' },
  notes:      { fontSize: 13, color: COLORS.textPrimary, fontStyle: 'italic', marginBottom: 12, lineHeight: 18 },
  refRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  monthRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  refLabel:   { fontSize: 10, fontWeight: '700', color: GOLD, letterSpacing: 1 },
  refValue:   { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  actions:    { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.dangerPrimary,
  },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 999, backgroundColor: TEAL,
  },
  btnLabel: { fontSize: 13, fontWeight: '700' },
});
