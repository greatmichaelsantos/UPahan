import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ROLES = [
  {
    key: 'admin',
    icon: 'shield-checkmark-outline',
    iconBg: COLORS.landlordLight,
    iconColor: COLORS.landlordPrimary,
    title: 'Landlord',
    sub: 'Property Owner / Manager',
    dest: 'Login',
    params: { role: 'admin' },
  },
  {
    key: 'tenant',
    icon: 'person-outline',
    iconBg: COLORS.tenantLight,
    iconColor: COLORS.tenantPrimary,
    title: 'Tenant',
    sub: 'Resident / Renter',
    dest: 'Login',
    params: { role: 'tenant' },
  },
];

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.houseBox}><Ionicons name="home" size={14} color={COLORS.landlordPrimary} /></View>
            <Text style={s.brandText}>UPAHAN</Text>
          </View>
          <Text style={s.brandTag}>RGT REAL ESTATE MARKETING</Text>
        </View>

        {/* Heading */}
        <Text style={s.heading}>Login As</Text>
        <Text style={s.headingSub}>Choose your account type to proceed.</Text>

        {/* Role cards */}
        <View style={s.cards}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.key}
              style={s.card}
              onPress={() => navigation.navigate(r.dest, r.params)}
              activeOpacity={0.85}
            >
              <View style={[s.roleIcon, { backgroundColor: r.iconBg }]}>
                <Ionicons name={r.icon} size={24} color={r.iconColor} />
              </View>
              <View style={s.roleText}>
                <Text style={s.roleTitle}>{r.title}</Text>
                <Text style={s.roleSub}>{r.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>OR</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Guest card */}
        <TouchableOpacity
          style={[s.card, s.guestCard]}
          onPress={() => navigation.navigate('Guest')}
          activeOpacity={0.85}
        >
          <View style={[s.roleIcon, { backgroundColor: '#F3F0FF' }]}>
            <Ionicons name="eye-outline" size={24} color="#6B4EFF" />
          </View>
          <View style={s.roleText}>
            <Text style={s.roleTitle}>Browse as Guest</Text>
            <Text style={s.roleSub}>View Available Units Only</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
          <Text style={s.backLinkText}>← Back to Welcome</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:   { padding: 20, paddingBottom: 40 },
  header:   { marginBottom: 32, paddingTop: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  houseBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  brandText:{ fontSize: 15, fontWeight: '800', color: COLORS.landlordPrimary, letterSpacing: 2 },
  brandTag: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1 },
  heading:  { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 6 },
  headingSub:{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  cards:    { gap: 12, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  guestCard:{ borderWidth: 1, borderColor: COLORS.borderLight },
  roleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  roleText: { flex: 1 },
  roleTitle:{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  roleSub:  { fontSize: 13, color: COLORS.textSecondary },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  dividerText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  backLink:    { alignItems: 'center', marginTop: 24 },
  backLinkText:{ fontSize: 14, color: COLORS.textLink, fontWeight: '600' },
});
