import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.splashBg} />
      <View style={s.center}>
        <View style={s.iconTile}>
          <Ionicons name="home" size={44} color="#fff" />
        </View>
        <Text style={s.brand}>UPAHAN</Text>
        <View style={s.gold} />
        <Text style={s.sub}>Zambales Properties — Digital Management System</Text>
      </View>

      <View style={s.bottom}>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('RoleSelect')} activeOpacity={0.85}>
          <Text style={s.btnText}>GET STARTED</Text>
        </TouchableOpacity>
        <Text style={s.footer}>RGT Real Estate Marketing  •  Version 1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.splashBg },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconTile:{ width: 88, height: 88, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  brand:   { fontSize: 36, fontWeight: '700', fontFamily: 'serif', color: '#fff', letterSpacing: 4, marginBottom: 10 },
  gold:    { width: 40, height: 2, backgroundColor: COLORS.goldAccent, marginBottom: 16 },
  sub:     { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  bottom:  { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  btn:     { height: 52, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '700', color: COLORS.splashBg, letterSpacing: 1.5 },
  footer:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
