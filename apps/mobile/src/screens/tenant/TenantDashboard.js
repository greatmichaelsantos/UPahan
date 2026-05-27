import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar,
  Animated, Easing, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ROUTES, formatPeso, formatDate } from '@upahan/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../constants/colors';

const TEAL     = COLORS.tenantPrimary;
const GOLD     = COLORS.goldAccent;
const SCREEN_H = Dimensions.get('window').height;

const NOTIF_TYPE = {
  payment:     { icon: 'cash-outline',          color: '#2E7D32', bg: '#E8F5E9' },
  maintenance: { icon: 'construct-outline',     color: '#F57F17', bg: '#FFF8E1' },
  unit:        { icon: 'home-outline',          color: '#277571', bg: '#E6F0F0' },
  lease:       { icon: 'document-text-outline', color: '#4A90D9', bg: '#EBF4FF' },
  default:     { icon: 'notifications-outline', color: '#666666', bg: '#F5F0E8' },
};

function formatType(type) {
  if (!type) return 'Notification';
  return type.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TenantDashboard({ navigation }) {
  const { user, tenantInfo, refreshTenantInfo } = useAuth();
  const [monthStatus, setMonthStatus]       = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);

  // Notifications panel
  const [panelVisible, setPanelVisible]           = useState(false);
  const [notifications, setNotifications]         = useState([]);
  const [notifLoading, setNotifLoading]           = useState(false);
  const [notifError, setNotifError]               = useState(null);
  const slideAnim    = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const translateY      = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-600, 0] });
  const backdropOpacity = backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, maintRes] = await Promise.all([
        api.get(API_ROUTES.PAYMENT_CURRENT_MONTH),
        api.get(API_ROUTES.MAINTENANCE),
      ]);
      setMonthStatus(statusRes.data.data);
      const reqs = maintRes.data.data || [];
      setRecentRequests(reqs.slice(0, 3));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    refreshTenantInfo();
    fetchData();
    fetchNotifications();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []));

  // Fetch notification badge count on mount
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch {
      // Silent fail — background polls should never disrupt the UI
    }
  }, []);

  const openNotifications = () => {
    setPanelVisible(true);
    fetchNotifications();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeNotifications = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setPanelVisible(false));
  };

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    api.put('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getPayStatus = () => {
    if (!monthStatus?.payments?.length) return 'unpaid';
    const statuses = monthStatus.payments.map(p => p.payment_status);
    if (statuses.includes('paid'))             return 'paid';
    if (statuses.includes('pending_approval')) return 'pending_approval';
    if (statuses.includes('partial'))          return 'partial';
    return 'unpaid';
  };

  const payStatus  = getPayStatus();
  const canSubmit  = payStatus === 'unpaid' || payStatus === 'partial';
  const hasPending = payStatus === 'pending_approval';
  const initials   = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'T';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90D9" />
      <View style={{ flex: 1 }}>

        {/* App header */}
        <View style={s.appHeader}>
          <View style={{ flex: 1 }}>
            <View style={s.logoRow}>
              <Ionicons name="home" size={22} color="#fff" />
              <Text style={s.brand}>UPAHAN</Text>
            </View>
            <Text style={s.brandSub}>TENANT PORTAL</Text>
          </View>
          <TouchableOpacity style={s.bellWrap} onPress={openNotifications}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor={TEAL}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator color={TEAL} style={{ marginTop: 60 }} size="large" />
          ) : (
            <>
              {/* Rent Card */}
              <View style={s.rentCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.rentLabel}>MONTHLY RENT</Text>
                  <StatusBadge status={payStatus} />
                </View>
                <Text style={s.rentAmount}>{formatPeso(tenantInfo?.monthly_price || 0)}</Text>
                <View style={s.rentRow}>
                  <Text style={s.rentUnit}>
                    {tenantInfo?.unit_code ? `Unit ${tenantInfo.unit_code}` : 'No unit assigned'}
                  </Text>
                </View>
                {hasPending ? (
                  <View style={s.pendingNotice}>
                    <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.85)" />
                    <Text style={s.pendingText}>Declaration submitted — awaiting approval</Text>
                  </View>
                ) : canSubmit ? (
                  <TouchableOpacity
                    style={s.payBtn}
                    onPress={() => navigation.navigate('TenantPaymentDeclare')}
                  >
                    <Ionicons name="card-outline" size={18} color="#fff" />
                    <Text style={s.payBtnText}>SUBMIT PAYMENT</Text>
                  </TouchableOpacity>
                ) : payStatus === 'paid' ? (
                  <TouchableOpacity
                    style={s.payBtn}
                    onPress={() => navigation.navigate('TenantPaymentDeclare', { initialType: 'advance' })}
                  >
                    <Ionicons name="card-outline" size={18} color="#fff" />
                    <Text style={s.payBtnText}>PAY IN ADVANCE</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Quick Actions */}
              <View style={s.actionsGrid}>
                <TouchableOpacity
                  style={s.actionCard}
                  onPress={() => navigation.navigate('Payments')}
                  activeOpacity={0.85}
                >
                  <View style={s.actionIconBlue}>
                    <Ionicons name="card-outline" size={26} color={COLORS.tenantPrimary} />
                  </View>
                  <Text style={s.actionLabel}>PAYMENT{'\n'}HISTORY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.actionCard}
                  onPress={() => navigation.navigate('TenantMaintenanceRequest')}
                  activeOpacity={0.85}
                >
                  <View style={s.actionIconAmber}>
                    <Ionicons name="construct" size={24} color="#E67E22" />
                  </View>
                  <Text style={s.actionLabel}>REQUEST{'\n'}MAINTENANCE</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar */}
              <CalendarWidget />

              {/* My Unit */}
              {tenantInfo?.unit_code && (
                <>
                  <Text style={s.secLabel}>MY UNIT</Text>
                  <View style={s.card}>
                    {tenantInfo.floor_plan       && <InfoRow label="Floor Plan"  value={tenantInfo.floor_plan} />}
                    {tenantInfo.location         && <InfoRow label="Location"    value={tenantInfo.location} />}
                    {tenantInfo.bedrooms         && <InfoRow label="Bedrooms"    value={tenantInfo.bedrooms} />}
                    {tenantInfo.lease_start_date && <InfoRow label="Lease Start" value={formatDate(tenantInfo.lease_start_date, 'medium')} />}
                    {tenantInfo.lease_end_date   && <InfoRow label="Lease End"   value={formatDate(tenantInfo.lease_end_date,   'medium')} />}
                  </View>
                  <Text style={s.secLabel}>LANDLORD</Text>
                  <View style={s.card}>
                    <InfoRow label="Name"    value={tenantInfo.landlord_name  || 'Not provided'} />
                    <InfoRow label="Contact" value={tenantInfo.landlord_phone || 'Not provided'} />
                  </View>
                </>
              )}

              {/* My Documents */}
              <Text style={s.secLabel}>MY DOCUMENTS</Text>
              <TouchableOpacity
                style={s.card}
                onPress={() => navigation.navigate('TenantDocuments')}
                activeOpacity={0.85}
              >
                <View style={s.docRow}>
                  <View style={s.docIcon}>
                    <Ionicons name="document-text-outline" size={18} color={TEAL} />
                  </View>
                  <Text style={s.docLabel}>View My Documents</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Recent requests */}
              {recentRequests.length > 0 && (
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardTitle}>Recent Requests</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Request')}>
                      <Text style={[s.seeAll, { color: TEAL }]}>See all</Text>
                    </TouchableOpacity>
                  </View>
                  {recentRequests.map((r, i) => (
                    <View
                      key={r.request_id}
                      style={[s.requestRow, i < recentRequests.length - 1 && s.requestBorder]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.requestSubject} numberOfLines={1}>{r.subject}</Text>
                        <Text style={s.requestCat}>{r.issue_category}</Text>
                      </View>
                      <StatusBadge status={r.status} />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Backdrop + panel — mounted while panelVisible, both animated in sync */}
        {panelVisible && (
          <>
            <Animated.View
              style={[np.backdrop, { opacity: backdropOpacity }]}
              pointerEvents={panelVisible ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={closeNotifications}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View style={[np.panel, { transform: [{ translateY }] }]}>
              {/* Header */}
              <View style={np.panelHeader}>
                <Text style={np.panelTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllRead} style={{ marginRight: 12 }}>
                    <Text style={np.markAll}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeNotifications} style={np.closeBtn}>
                  <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              {notifLoading ? (
                <ActivityIndicator color={TEAL} style={{ marginVertical: 36 }} />
              ) : notifError ? (
                <View style={np.emptyWrap}>
                  <Ionicons name="alert-circle-outline" size={40} color={COLORS.textMuted} />
                  <Text style={np.emptyText}>{notifError}</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={np.emptyWrap}>
                  <Ionicons name="notifications-off-outline" size={40} color={COLORS.textMuted} />
                  <Text style={np.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                <FlatList
                  data={notifications}
                  keyExtractor={item => String(item.notification_id)}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    const cfg = NOTIF_TYPE[item.type] || NOTIF_TYPE.default;
                    return (
                      <TouchableOpacity
                        style={[np.card, index < notifications.length - 1 && np.cardBorder]}
                        onPress={() => markRead(item.notification_id)}
                        activeOpacity={0.75}
                      >
                        {!item.is_read && <View style={np.unreadDot} />}
                        <View style={[np.iconWrap, { backgroundColor: cfg.bg }]}>
                          <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={np.cardTitle} numberOfLines={1}>{formatType(item.type)}</Text>
                          <Text style={np.cardMsg}   numberOfLines={2}>{item.message}</Text>
                        </View>
                        <Text style={np.cardTime}>{timeAgo(item.created_at)}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </Animated.View>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function CalendarWidget() {
  const today    = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDays  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <View style={cal.wrap}>
      <Text style={cal.monthText}>{monthName}</Text>
      <View style={cal.dayLabels}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <Text key={d} style={cal.dayLabel}>{d}</Text>
        ))}
      </View>
      <View style={cal.grid}>
        {weekDays.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <View key={i} style={cal.cell}>
              <View style={[cal.dayCircle, isToday && cal.todayCircle]}>
                <Text style={[cal.day, isToday && cal.todayDay]}>{d.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  monthText:  { fontSize: 15, fontWeight: '700', color: COLORS.tenantPrimary, textAlign: 'center', marginBottom: 12 },
  dayLabels:  { flexDirection: 'row', marginBottom: 4 },
  dayLabel:   { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  grid:       { flexDirection: 'row' },
  cell:       { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayCircle:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  todayCircle:{ backgroundColor: COLORS.tenantPrimary },
  day:        { fontSize: 13, color: COLORS.textPrimary },
  todayDay:   { color: '#fff', fontWeight: '700' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  appHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#4A90D9', paddingHorizontal: 20, paddingVertical: 14,
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand:    { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  brandSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginTop: 3 },
  bellWrap:   { position: 'relative', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: COLORS.dangerPrimary, width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.tenantLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: COLORS.tenantPrimary },
  scroll:     { padding: 20, paddingBottom: 32 },
  rentCard: {
    backgroundColor: COLORS.tenantPrimary, borderRadius: 16, padding: 22, marginBottom: 16,
    shadowColor: COLORS.tenantPrimary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  rentLabel:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 6 },
  rentAmount: { fontSize: 36, fontFamily: 'Inter_800ExtraBold', color: '#fff', marginBottom: 10 },
  rentRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  rentUnit:   { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  pendingNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12,
  },
  pendingText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 48,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  payBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  actionIconGold:  { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FDF6E3', alignItems: 'center', justifyContent: 'center' },
  actionIconBlue:  { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3F0FB', alignItems: 'center', justifyContent: 'center' },
  actionIconAmber: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', letterSpacing: 0.5 },
  secLabel: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, maxWidth: '60%', textAlign: 'right' },
  docRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.tenantLight, alignItems: 'center', justifyContent: 'center' },
  docLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  seeAll:        { fontSize: 12, fontWeight: '600' },
  requestRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  requestBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  requestSubject:{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  requestCat:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
});

const np = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999,
  },
  panel: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  panelTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  markAll:    { fontSize: 13, fontWeight: '600', color: TEAL },
  closeBtn:   { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  emptyWrap:  { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText:  { fontSize: 14, color: COLORS.textMuted },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14, position: 'relative',
  },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  unreadDot: {
    position: 'absolute', left: 8, top: 20,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#4A90D9',
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  cardMsg:   { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  cardTime:  { fontSize: 11, color: COLORS.textMuted, flexShrink: 0 },
});
