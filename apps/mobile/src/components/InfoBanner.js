import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function InfoBanner({ text }) {
  return (
    <View style={s.banner}>
      <Ionicons name="information-circle-outline" size={16} color="#F57F17" style={s.icon} />
      <Text style={s.text}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.infoBannerBg,
    borderLeftWidth: 3, borderLeftColor: COLORS.infoBannerBorder,
    borderRadius: 8, padding: 12,
  },
  icon: { marginTop: 1, flexShrink: 0 },
  text: { flex: 1, fontSize: 13, color: '#5D4037', lineHeight: 18 },
});
