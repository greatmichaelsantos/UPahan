import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

export default function ForgotPasswordScreen({ route, navigation }) {
  const role    = route?.params?.role || 'tenant';
  const primary = role === 'admin' ? COLORS.landlordPrimary : COLORS.tenantPrimary;

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo row */}
          <View style={s.logoRow}>
            <View style={[s.logoBox, { backgroundColor: role === 'admin' ? COLORS.landlordLight : '#E3F0FB' }]}>
              <Ionicons name="home" size={14} color={primary} />
            </View>
            <Text style={[s.logoText, { color: primary }]}>UPAHAN</Text>
          </View>

          {/* Badge */}
          <View style={[s.badge, { backgroundColor: primary }]}>
            <Text style={s.badgeText}>FORGOT PASSWORD</Text>
          </View>

          <Text style={s.heading}>Reset Password</Text>
          <View style={[s.gold, { backgroundColor: primary }]} />
          <Text style={s.sub}>
            {sent
              ? 'Check your inbox for a reset link. It expires in 1 hour.'
              : "Enter your registered email and we'll send you a reset link."}
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.dangerPrimary} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {sent ? (
            <View style={s.successBox}>
              <Ionicons name="checkmark-circle-outline" size={15} color="#2E7D32" />
              <Text style={s.successText}>If that email is registered, a reset link has been sent.</Text>
            </View>
          ) : (
            <>
              <Text style={s.label}>Email Address</Text>
              <View style={s.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#888" style={s.inputIcon} />
                <TextInput
                  style={s.inputField}
                  placeholder="you@example.com"
                  placeholderTextColor="#AAA"
                  value={email}
                  onChangeText={t => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[s.btn, { backgroundColor: primary }, loading && { opacity: 0.65 }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>SEND RESET LINK</Text>}
              </TouchableOpacity>
            </>
          )}

          {sent && (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: primary, marginTop: 16 }]}
              onPress={() => navigation.navigate('Login', { role })}
              activeOpacity={0.85}
            >
              <Text style={s.btnText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity style={s.backRoleBtn} onPress={() => navigation.goBack()}>
        <Text style={[s.backRoleText, { color: primary }]}>← Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:     { padding: 24, paddingBottom: 40, alignItems: 'center' },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, alignSelf: 'flex-start' },
  logoBox:    { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  badge:      { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20 },
  badgeText:  { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  heading:    { fontSize: 32, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 10 },
  gold:       { width: 40, height: 2, marginBottom: 10 },
  sub:        { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center', maxWidth: 300 },
  errorBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  errorText:  { flex: 1, fontSize: 13, color: COLORS.dangerPrimary },
  successBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  successText:{ flex: 1, fontSize: 13, color: '#2E7D32' },
  label:      { alignSelf: 'flex-start', fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, height: 52, paddingHorizontal: 14, marginBottom: 16, width: '100%', borderWidth: 1.5, borderColor: COLORS.borderLight },
  inputIcon:  { marginRight: 10 },
  inputField: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  btn:        { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 2 },
  backRoleBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.pageBg },
  backRoleText:{ fontSize: 13, fontWeight: '600' },
});
