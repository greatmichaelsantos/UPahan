import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoadingScreen({ color }) {
  return (
    <View style={s.wrap}>
      <ActivityIndicator size="large" color={color || COLORS.landlordPrimary} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.pageBg },
});
