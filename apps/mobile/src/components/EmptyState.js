import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function EmptyState({ icon = 'cube-outline', title, message }) {
  return (
    <View style={s.wrap}>
      <View style={s.iconBox}>
        <Ionicons name={icon} size={36} color={COLORS.landlordPrimary} />
      </View>
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.msg}>{message}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  iconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:   { fontSize: 18, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  msg:     { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
