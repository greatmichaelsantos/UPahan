import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

export default function PrimaryButton({
  label, onPress, color, outlined = false,
  loading = false, disabled = false, style,
}) {
  const bg   = outlined ? 'transparent' : (color || COLORS.landlordPrimary);
  const bd   = color || COLORS.landlordPrimary;
  const txt  = outlined ? bd : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg, borderColor: bd }, outlined && s.outlined, (disabled || loading) && s.muted, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={outlined ? bd : '#fff'} />
        : <Text style={[s.label, { color: txt }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    height: LAYOUT.buttonHeight,
    borderRadius: LAYOUT.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  outlined: {},
  muted: { opacity: 0.6 },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 1.5 },
});
