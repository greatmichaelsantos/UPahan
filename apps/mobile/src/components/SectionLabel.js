import React from 'react';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SectionLabel({ text, color }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
      color: color || COLORS.goldAccent, textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {text}
    </Text>
  );
}
