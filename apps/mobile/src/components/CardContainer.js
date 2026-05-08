import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

export default function CardContainer({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: LAYOUT.cardRadius,
    padding: 16,
    ...LAYOUT.cardShadow,
  },
});
