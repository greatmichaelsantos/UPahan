import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function UploadZone({ label, sublabel, onPress, color }) {
  const c = color || COLORS.landlordPrimary;
  return (
    <TouchableOpacity style={[s.zone, { borderColor: c }]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="camera-outline" size={28} color={c} />
      <Text style={[s.label, { color: c }]}>{label || 'Tap to upload'}</Text>
      {sublabel ? <Text style={s.sub}>{sublabel}</Text> : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  zone:  { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center', gap: 8, backgroundColor: '#FAFAFA' },
  label: { fontSize: 14, fontWeight: '600' },
  sub:   { fontSize: 12, color: '#999999', textAlign: 'center' },
});
