import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CONFIGS = {
  paid:              { bg: COLORS.paidBg,        text: COLORS.paidText,       label: 'PAID' },
  unpaid:            { bg: COLORS.unpaidBg,      text: COLORS.unpaidText,     label: 'UNPAID' },
  partial:           { bg: COLORS.inProgressBg,  text: COLORS.inProgressText, label: 'PARTIAL' },
  late:              { bg: COLORS.unpaidBg,      text: COLORS.unpaidText,     label: 'LATE' },
  advance:           { bg: COLORS.paidBg,        text: COLORS.paidText,       label: 'ADVANCE' },
  pending:           { bg: COLORS.pendingBg,     text: COLORS.pendingText,    label: 'PENDING' },
  pending_approval:  { bg: COLORS.pendingBg,     text: COLORS.pendingText,    label: 'PENDING' },
  completed:         { bg: COLORS.completedBg,   text: COLORS.completedText,  label: 'COMPLETED' },
  in_progress:       { bg: COLORS.inProgressBg,  text: COLORS.inProgressText, label: 'IN PROGRESS' },
  vacant:            { bg: '#F3E8FF',            text: '#6B21A8',             label: 'VACANT' },
  occupied:          { bg: COLORS.paidBg,        text: COLORS.paidText,       label: 'OCCUPIED' },
  under_maintenance: { bg: COLORS.pendingBg,     text: COLORS.pendingText,    label: 'MAINTENANCE' },
  high:              { bg: COLORS.unpaidBg,      text: COLORS.unpaidText,     label: 'HIGH' },
  medium:            { bg: COLORS.pendingBg,     text: COLORS.pendingText,    label: 'MEDIUM' },
  low:               { bg: COLORS.lowBg,         text: COLORS.lowText,        label: 'LOW' },
  rejected:          { bg: COLORS.unpaidBg,      text: COLORS.unpaidText,     label: 'REJECTED' },
  verified:          { bg: COLORS.paidBg,        text: COLORS.paidText,       label: 'VERIFIED' },
  under_review:      { bg: COLORS.pendingBg,     text: COLORS.pendingText,    label: 'UNDER REVIEW' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIGS[status] || { bg: '#F5F5F5', text: '#555555', label: (status || '—').toUpperCase() };
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
