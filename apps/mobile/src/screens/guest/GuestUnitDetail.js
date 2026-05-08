import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StatusBar, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_ROUTES, formatPeso } from '@upahan/shared';
import api, { BASE_URL } from '../../api/client';
import { COLORS } from '../../constants/colors';

const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const STATIC_FEATURES = ['Monthly Payment', 'CCTV Security', 'Flood Free', 'Safe Neighborhood'];

export default function GuestUnitDetail({ route, navigation }) {
  const { unitId } = route.params;
  const [unit, setUnit]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(API_ROUTES.unitById(unitId));
        setUnit(res.data.data);
      } catch {
        navigation.goBack();
      }
      setLoading(false);
    })();
  }, [unitId]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
        <ActivityIndicator color={TEAL} style={{ marginTop: 80 }} size="large" />
      </SafeAreaView>
    );
  }
  if (!unit) return null;

  const photos = (unit.unit_photos || unit.photos || []).filter(Boolean);

  const getFeatures = () => {
    const features = [];
    if (unit.bedrooms)   features.push(unit.bedrooms);
    if (unit.floor_plan) unit.floor_plan.split(',').forEach(p => features.push(p.trim()));
    return [...features, ...STATIC_FEATURES];
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Photo section */}
        <View style={s.photoSection}>
          {photos.length > 0 ? (
            <Image
              source={{ uri: photos[photoIndex].startsWith('http') ? photos[photoIndex] : `${BASE_URL}${photos[photoIndex]}` }}
              style={s.mainPhoto}
            />
          ) : (
            <View style={[s.mainPhoto, s.photoPlaceholder]}>
              <Ionicons name="home-outline" size={56} color="rgba(74,74,74,0.2)" />
            </View>
          )}

          {/* Back button overlay */}
          <TouchableOpacity style={s.backOverlay} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Price overlay */}
          <View style={s.priceOverlay}>
            <Text style={s.priceOverlayAmount}>{formatPeso(unit.monthly_price)}</Text>
            <Text style={s.priceOverlayMo}>/month</Text>
          </View>

          {/* Thumbnail grid */}
          {photos.length > 1 && (
            <View style={s.thumbGrid}>
              {photos.slice(1, 4).map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setPhotoIndex(i + 1)} style={{ flex: 1 }}>
                  <Image
                    source={{ uri: p.startsWith('http') ? p : `${BASE_URL}${p}` }}
                    style={s.thumbImg}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={s.content}>

          {/* Title + location */}
          <Text style={s.unitTitle}>Unit {unit.unit_code} Details</Text>
          {unit.location && (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={s.location}>{unit.location}</Text>
            </View>
          )}

          {/* Description */}
          {unit.description && (
            <View style={s.card}>
              <Text style={s.cardLabel}>ABOUT THIS UNIT</Text>
              <Text style={s.description}>{unit.description}</Text>
            </View>
          )}

          {/* Gold divider */}
          <View style={s.goldDivider} />

          {/* Features */}
          <Text style={s.featuresLabel}>FEATURES & DETAILS</Text>
          <View style={s.featuresGrid}>
            {getFeatures().map((f, i) => (
              <View key={i} style={s.featureChip}>
                <Ionicons name="checkmark-circle" size={12} color={TEAL} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Gold divider */}
          <View style={s.goldDivider} />

          {/* Contact Owner */}
          <View style={s.card}>
            <Text style={s.contactTitle}>Contact Owner</Text>
            <View style={s.ownerRow}>
              <View style={s.ownerAvatar}>
                <Text style={s.ownerAvatarText}>R</Text>
              </View>
              <View>
                <Text style={s.ownerName}>RGT Real Estate</Text>
                <Text style={s.ownerRole}>Property Owner / Manager</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.contactBtn, { backgroundColor: TEAL }]}
              onPress={() => Linking.openURL('tel:+63171234567')}
            >
              <Ionicons name="call-outline" size={16} color="#fff" />
              <Text style={s.contactBtnText}>CALL OWNER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.contactBtn, s.contactBtnOutline, { marginTop: 8 }]}
              onPress={() => Linking.openURL('mailto:rgt@upahan.ph')}
            >
              <Ionicons name="mail-outline" size={16} color={TEAL} />
              <Text style={[s.contactBtnText, { color: TEAL }]}>EMAIL OWNER</Text>
            </TouchableOpacity>
          </View>

          {/* Register CTA */}
          <TouchableOpacity
            style={s.registerBtn}
            onPress={() => navigation.navigate('Register', { role: 'tenant' })}
            activeOpacity={0.88}
          >
            <Ionicons name="person-add-outline" size={18} color="#fff" />
            <Text style={s.registerBtnText}>REGISTER AS TENANT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.loginLink}
            onPress={() => navigation.navigate('Login', { role: 'tenant' })}
          >
            <Text style={s.loginLinkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.pageBg },
  photoSection:{ position: 'relative' },
  mainPhoto:   { width: '100%', height: 260 },
  photoPlaceholder: { backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  backOverlay: {
    position: 'absolute', top: 14, left: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  priceOverlay: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  priceOverlayAmount: { fontSize: 18, fontWeight: '700', fontFamily: 'serif', color: TEAL },
  priceOverlayMo:     { fontSize: 12, color: COLORS.textSecondary },
  thumbGrid: { flexDirection: 'row', gap: 2 },
  thumbImg:  { width: '100%', height: 100 },
  content:   { padding: 20, gap: 16 },
  unitTitle: { fontSize: 28, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary, marginBottom: 8 },
  locationRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  location:   { fontSize: 13, color: COLORS.textSecondary },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardLabel:   { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  goldDivider: { height: 1, backgroundColor: GOLD, opacity: 0.3, marginVertical: 4 },
  featuresLabel: { fontSize: 11, fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  featuresGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.landlordLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  featureText:  { fontSize: 12, fontWeight: '600', color: TEAL },
  contactTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary, marginBottom: 16 },
  ownerRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  ownerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  ownerAvatarText: { fontSize: 20, fontWeight: '700', color: TEAL },
  ownerName:   { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  ownerRole:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  contactBtn:  { height: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  contactBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: TEAL },
  contactBtnText:    { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  registerBtn: {
    backgroundColor: TEAL, height: 52, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 8,
  },
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  loginLink:     { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { fontSize: 13, color: TEAL, fontWeight: '600' },
});
