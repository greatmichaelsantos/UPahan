import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import api from '../../api/client';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

function formatPeso(amount) {
  if (amount == null) return '₱0.00';
  return '₱' + parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({ label, value, accent }) {
  return (
    <View style={[s.statCard, accent && { backgroundColor: TEAL }]}>
      <Text style={[s.statLabel, accent && { color: 'rgba(255,255,255,0.75)' }]}>{label}</Text>
      <Text style={[s.statValue, accent && { color: '#fff' }]}>{value}</Text>
    </View>
  );
}

function StatusPill({ status, isLate }) {
  const map = {
    verified:         { bg: '#E8F5F3', color: '#2E7D72', label: 'VERIFIED' },
    paid:             { bg: '#E8F5F3', color: '#2E7D72', label: 'VERIFIED' },
    partial:          { bg: '#EEF1FA', color: '#3A5BA0', label: 'PARTIAL' },
    pending_approval: { bg: '#FEF3EC', color: '#E07B39', label: 'PENDING' },
    not_verified:     { bg: '#FDEEEE', color: '#D64045', label: 'NOT VERIFIED' },
    rejected:         { bg: '#FDEEEE', color: '#D64045', label: 'NOT VERIFIED' },
    pending:          { bg: '#FEF3EC', color: '#E07B39', label: 'PENDING' },
    in_progress:      { bg: '#EEF1FA', color: '#3A5BA0', label: 'IN PROGRESS' },
    completed:        { bg: '#E8F5F3', color: '#2E7D72', label: 'COMPLETED' },
  };
  const cfg = map[status] || { bg: '#F0EEEB', color: '#888', label: status?.toUpperCase() || '—' };
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <View style={[s.pill, { backgroundColor: cfg.bg }]}>
        <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
      {isLate && (
        <View style={[s.pill, { backgroundColor: '#FEF3EC' }]}>
          <Text style={[s.pillText, { color: '#E07B39' }]}>LATE</Text>
        </View>
      )}
    </View>
  );
}

export default function AdminReports() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const [period, setPeriod]       = useState('monthly');
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(today);
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleGenerate = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = period === 'custom'
        ? `period=custom&start_date=${startDate}&end_date=${endDate}`
        : `period=${period}`;
      const res = await api.get(`/reports/landlord?${params}`);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.pageBg }} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerSub}>REPORTS</Text>
        <Text style={s.headerTitle}>Reports</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }}>

        {/* Period selector */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>SELECT PERIOD</Text>
          <View style={s.pillRow}>
            {[
              { key: 'weekly',  label: 'This Week' },
              { key: 'monthly', label: 'This Month' },
              { key: 'custom',  label: 'Custom Range' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setPeriod(key)}
                style={[s.periodBtn, period === key && s.periodBtnActive]}
              >
                <Text style={[s.periodBtnText, period === key && s.periodBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {period === 'custom' && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <View>
                <Text style={s.sectionLabel}>START DATE (YYYY-MM-DD)</Text>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  style={s.dateInput}
                  keyboardType="numeric"
                />
              </View>
              <View>
                <Text style={s.sectionLabel}>END DATE (YYYY-MM-DD)</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  style={s.dateInput}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={loading}
            style={[s.generateBtn, loading && { backgroundColor: '#888', opacity: 0.7 }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.generateBtnText}>Generate Report</Text>
            }
          </TouchableOpacity>
          {!!error && <Text style={s.errorText}>{error}</Text>}
        </View>

        {!report && !loading && (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>No Report Yet</Text>
            <Text style={s.emptyMsg}>Select a period and tap Generate Report.</Text>
          </View>
        )}

        {report && (
          <>
            {/* Period header */}
            <View style={[s.periodHeader, { backgroundColor: TEAL }]}>
              <Text style={s.periodHeaderSub}>REPORT PERIOD</Text>
              <Text style={s.periodHeaderText}>{fmtDate(report.period.start)} — {fmtDate(report.period.end)}</Text>
            </View>

            {/* Unit Occupancy */}
            <View style={s.card}>
              <Text style={s.sectionLabel}>UNIT OCCUPANCY</Text>
              <View style={s.statRow}>
                <StatCard label="Occupied" value={report.units.occupied} accent />
                <StatCard label="Vacant" value={report.units.vacant} />
              </View>
              <View style={[s.statRow, { marginTop: 10 }]}>
                <StatCard label="Total Units" value={report.units.total} />
                <StatCard label="Occupancy Rate" value={report.units.occupancy_rate} />
              </View>
            </View>

            {/* Payments */}
            <View style={s.card}>
              <Text style={s.sectionLabel}>PAYMENTS</Text>
              <Text style={s.bigAmount}>{formatPeso(report.payments.total_collected)}</Text>
              <View style={s.statRow}>
                <StatCard label="Transactions" value={report.payments.total_transactions} />
                <StatCard label="Late" value={report.payments.late_payments} />
                <StatCard label="Not Verified" value={report.payments.not_verified} />
              </View>
              {report.payments.breakdown.length === 0 ? (
                <Text style={s.noData}>No payment data for the selected period.</Text>
              ) : (
                <View style={{ marginTop: 14 }}>
                  <View style={s.tableHeader}>
                    {['Unit', 'Tenant', 'Amount', 'Status'].map(h => (
                      <Text key={h} style={[s.tableHeaderCell, h === 'Amount' && { flex: 1.2 }, h === 'Tenant' && { flex: 1.5 }]}>{h}</Text>
                    ))}
                  </View>
                  {report.payments.breakdown.map((p, i) => (
                    <View key={i} style={s.tableRow}>
                      <Text style={[s.tableCell, s.tableCellBold]}>{p.unit_code}</Text>
                      <Text style={[s.tableCell, { flex: 1.5 }]} numberOfLines={1}>{p.tenant}</Text>
                      <Text style={[s.tableCell, { flex: 1.2, color: TEAL, fontWeight: '700' }]}>{formatPeso(p.amount)}</Text>
                      <View style={{ flex: 1 }}>
                        <StatusPill status={p.status} isLate={p.is_late} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Maintenance */}
            <View style={s.card}>
              <Text style={s.sectionLabel}>MAINTENANCE</Text>
              <View style={s.statRow}>
                <StatCard label="Total" value={report.maintenance.total_requests} />
                <StatCard label="Resolved" value={report.maintenance.resolved} accent />
                <StatCard label="Pending" value={report.maintenance.pending} />
              </View>
              {report.maintenance.breakdown.length === 0 ? (
                <Text style={s.noData}>No maintenance data for the selected period.</Text>
              ) : (
                <View style={{ marginTop: 14 }}>
                  <View style={s.tableHeader}>
                    {['Unit', 'Category', 'Status', 'Date'].map(h => (
                      <Text key={h} style={s.tableHeaderCell}>{h}</Text>
                    ))}
                  </View>
                  {report.maintenance.breakdown.map((m, i) => (
                    <View key={i} style={s.tableRow}>
                      <Text style={[s.tableCell, s.tableCellBold]}>{m.unit_code}</Text>
                      <Text style={[s.tableCell, { textTransform: 'capitalize' }]} numberOfLines={1}>{m.category}</Text>
                      <View style={{ flex: 1 }}>
                        <StatusPill status={m.status} />
                      </View>
                      <Text style={[s.tableCell, s.tableCellMuted, { fontSize: 11 }]}>{fmtDate(m.date)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 2,
  },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: GOLD,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 0 },
  periodBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#E0DDD8', backgroundColor: '#fff',
  },
  periodBtnActive: { borderColor: TEAL, backgroundColor: TEAL },
  periodBtnText: { fontSize: 13, fontWeight: '700', color: '#4A4A4A' },
  periodBtnTextActive: { color: '#fff' },
  dateInput: {
    height: 42, borderRadius: 8, borderWidth: 1.5, borderColor: '#E0DDD8',
    paddingHorizontal: 12, fontSize: 13, backgroundColor: '#fff',
    marginTop: 4,
  },
  generateBtn: {
    marginTop: 14, height: 46, borderRadius: 8, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  generateBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  errorText: { color: '#D64045', fontSize: 13, marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4A4A4A', marginBottom: 6 },
  emptyMsg: { fontSize: 13, color: '#888', textAlign: 'center' },
  periodHeader: {
    borderRadius: 10, padding: 14, marginBottom: 2,
  },
  periodHeaderSub: {
    color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2,
  },
  periodHeaderText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#F0EEEB', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center',
  },
  statLabel: {
    fontSize: 9, fontWeight: '700', color: GOLD,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#4A4A4A' },
  bigAmount: { fontSize: 26, fontWeight: '800', color: TEAL, marginBottom: 12 },
  noData: { fontSize: 13, color: '#888', marginTop: 10 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#FAF8F5',
    paddingVertical: 8, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#E0DDD8',
  },
  tableHeaderCell: {
    flex: 1, fontSize: 9, fontWeight: '700', color: GOLD,
    textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#F0EEEB',
  },
  tableCell: { flex: 1, fontSize: 12, color: '#4A4A4A', paddingHorizontal: 4 },
  tableCellBold: { fontWeight: '700' },
  tableCellMuted: { color: '#888' },
  pill: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  pillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
});
