import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function AppHeader({ bellCount = 0, initials = '', onBell, onAvatar }) {
  return (
    <View style={s.wrap}>
      <View style={s.brand}>
        <View style={s.houseBox}>
          <Ionicons name="home" size={15} color={COLORS.landlordPrimary} />
        </View>
        <Text style={s.brandText}>UPAHAN</Text>
      </View>
      <View style={s.right}>
        {onBell !== undefined && (
          <TouchableOpacity style={s.bellWrap} onPress={onBell}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            {bellCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{bellCount > 9 ? '9+' : bellCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {initials ? (
          <TouchableOpacity style={s.avatar} onPress={onAvatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEBE5' },
  brand:     { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  houseBox:  { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 15, fontWeight: '800', color: COLORS.landlordPrimary, letterSpacing: 2 },
  right:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellWrap:  { position: 'relative' },
  badge:     { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.dangerPrimary, borderRadius: 999, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  avatar:    { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.tenantPrimary, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 12, fontWeight: '700', color: '#fff' },
});
