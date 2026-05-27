import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <View style={s.center}>
        <View style={s.iconTile}>
          <MaterialCommunityIcons name="home" size={48} color="#FFFFFF" />
        </View>
        <Text style={s.brand}>UPAHAN</Text>
        <View style={s.gold} />
        <Text style={s.sub}>Your Properties. Managed Smarter.</Text>
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
  safe:    { flex: 1, backgroundColor: '#FAF8F5' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconTile:{ width: 88, height: 88, borderRadius: 22, backgroundColor: '#277571', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  brand:   { fontSize: 36, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#277571', letterSpacing: 4, marginBottom: 10 },
  gold:    { width: 40, height: 2, backgroundColor: COLORS.goldAccent, marginBottom: 16 },
  sub:     { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20 },
  bottom:  { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  btn:     { height: 52, borderRadius: 999, backgroundColor: '#277571', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  footer:  { fontSize: 11, color: '#999999', textAlign: 'center' },
});
