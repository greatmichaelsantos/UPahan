import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, RefreshControl, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatDate, formatDateTime, categoryLabel } from '@upahan/shared';
import api, { BASE_URL } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const PRIORITY_COLORS = { high: COLORS.dangerPrimary, medium: '#E07B39', low: COLORS.textMuted };

const STATUS_TRANSITIONS = {
  pending:     [{ value: 'completed', label: 'MARK AS RESOLVED', color: TEAL }],
  in_progress: [{ value: 'completed', label: 'MARK AS RESOLVED', color: TEAL }],
  completed:   [],
};

export default function AdminMaintenanceDetail({ route, navigation }) {
  const { requestId } = route.params;
  const [request, setRequest]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef(null);

  const fetchRequest = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(API_ROUTES.maintenanceById(requestId));
      setRequest(res.data.data);
    } catch {}
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, [requestId]);

  useFocusEffect(useCallback(() => {
    fetchRequest(false);
    intervalRef.current = setInterval(() => fetchRequest(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRequest]));

  const handleUpdateStatus = (newStatus, label) => {
    Alert.alert('Update Status', `Set request to "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(true);
          try {
            await api.put(API_ROUTES.maintenanceById(requestId), { status: newStatus });
            fetchRequest();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Update failed.');
          }
          setUpdating(false);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <ActivityIndicator color={TEAL} style={{ marginTop: 60 }} size="large" />
      </SafeAreaView>
    );
  }
  if (!request) return null;

  const photos        = request.photos?.filter(Boolean) || [];
  const actions       = STATUS_TRANSITIONS[request.status] || [];
  const priorityColor = PRIORITY_COLORS[request.priority_level] || COLORS.textMuted;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerLabel}>MAINTENANCE</Text>
          <Text style={s.headerTitle} numberOfLines={1}>Request Details</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRequest(true); }}
            tintColor={TEAL}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Subject card — overlaps header */}
        <View style={s.subjectCard}>
          <View style={s.priorityRow}>
            <View style={[s.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[s.priorityText, { color: priorityColor }]}>
              {request.priority_level?.toUpperCase()} PRIORITY
            </Text>
          </View>
          <Text style={s.subject}>{request.subject}</Text>
          <Text style={s.category}>{categoryLabel(request.issue_category)}</Text>
        </View>

        {/* 2×2 Info grid */}
        <View style={s.infoGrid}>
          <View style={[s.infoCard, { flex: 1 }]}>
            <Text style={s.infoLabel}>STATUS</Text>
            <StatusBadge status={request.status} />
          </View>
          <View style={[s.infoCard, { flex: 1 }]}>
            <Text style={s.infoLabel}>REPORTED</Text>
            <Text style={s.infoValue}>{formatDateTime(request.report_date)}</Text>
          </View>
        </View>

        <View style={s.infoGrid}>
          <View style={[s.infoCard, { flex: 1 }]}>
            <Text style={s.infoLabel}>RESIDENT</Text>
            <Text style={s.infoValue}>{request.tenant_name || '—'}</Text>
          </View>
          <View style={[s.infoCard, { flex: 1 }]}>
            <Text style={s.infoLabel}>UNIT</Text>
            <Text style={s.infoValue}>Unit {request.unit_code || '—'}</Text>
          </View>
        </View>

        {request.description && (
          <>
            <Text style={s.secLabel}>DESCRIPTION</Text>
            <View style={[s.card, { backgroundColor: COLORS.pageBg }]}>
              <Text style={s.desc}>{request.description}</Text>
            </View>
          </>
        )}

        {request.resolved_date && (
          <>
            <Text style={s.secLabel}>RESOLVED ON</Text>
            <View style={s.card}>
              <Text style={s.desc}>{formatDateTime(request.resolved_date)}</Text>
            </View>
          </>
        )}

        {photos.length > 0 && (
          <>
            <Text style={s.secLabel}>PHOTOS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
              {photos.map((p, i) => (
                <Image key={i} source={{ uri: `${BASE_URL}${p}` }} style={s.photo} />
              ))}
            </ScrollView>
          </>
        )}

        {actions.length > 0 && (
          <View style={s.actionsWrap}>
            {actions.map(a => (
              <TouchableOpacity
                key={a.value}
                style={[s.actionBtn, { backgroundColor: a.color }, updating && { opacity: 0.6 }]}
                onPress={() => handleUpdateStatus(a.value, a.label)}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.actionBtnText}>{a.label}</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.actionBtnOutline]}
              onPress={() => Alert.alert('Assign to Staff', 'Staff assignment coming soon.')}
            >
              <Ionicons name="person-add-outline" size={18} color={TEAL} />
              <Text style={s.actionBtnOutlineText}>ASSIGN TO STAFF</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pageBg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, backgroundColor: TEAL,
  },
  headerLabel: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#fff' },
  scroll:     { paddingBottom: 40 },
  subjectCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginHorizontal: 20, marginTop: -16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  priorityText:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  subject:     { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 4 },
  category:    { fontSize: 13, color: COLORS.textSecondary },
  infoGrid:    { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 10 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: GOLD, letterSpacing: 1, marginBottom: 8 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  secLabel: {
    fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1.5,
    marginLeft: 20, marginBottom: 8, marginTop: 16,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginHorizontal: 20, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  desc:      { fontSize: 14, color: COLORS.textPrimary, lineHeight: 21 },
  photoRow:  { paddingHorizontal: 20, marginBottom: 8 },
  photo:     { width: 200, height: 140, borderRadius: 12, marginRight: 10 },
  actionsWrap: { marginHorizontal: 20, marginTop: 16, gap: 10 },
  actionBtn: {
    borderRadius: 999, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  actionBtnOutline: {
    borderRadius: 999, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: TEAL,
  },
  actionBtnOutlineText: { color: TEAL, fontWeight: '700', fontSize: 14, letterSpacing: 1 },
});
