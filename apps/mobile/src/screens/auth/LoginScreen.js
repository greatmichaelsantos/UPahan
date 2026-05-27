import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function LoginScreen({ route, navigation }) {
  const role    = route?.params?.role || 'admin';
  const isAdmin = role === 'admin';
  const primary = isAdmin ? COLORS.landlordPrimary : COLORS.tenantPrimary;
  const badgeLabel = isAdmin ? 'LOGIN AS LANDLORD' : 'LOGIN AS TENANT';

  const { login } = useAuth();
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email.trim().toLowerCase(), password, role);
    if (!result.success) setError(result.message);
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.pageBg }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoRow}>
            <View style={[s.logoBox, { backgroundColor: isAdmin ? COLORS.landlordLight : '#E3F0FB' }]}>
              <Ionicons name="home" size={16} color={primary} />
            </View>
            <Text style={[s.logoText, { color: primary }]}>UPAHAN</Text>
          </View>

          {/* Role badge */}
          <View style={[s.badge, { backgroundColor: primary }]}>
            <Text style={s.badgeText}>{badgeLabel}</Text>
          </View>

          {/* Heading */}
          <Text style={s.heading}>Welcome</Text>
          <View style={[s.accentLine, { backgroundColor: primary }]} />

          {/* Error */}
          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.dangerPrimary} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email input */}
          <Text style={s.label}>Email</Text>
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
            />
          </View>

          {/* Password input */}
          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#888" style={s.inputIcon} />
            <TextInput
              style={s.inputField}
              placeholder="••••••••"
              placeholderTextColor="#AAA"
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword', { role })}>
            <Text style={[s.forgotText, { color: primary }]}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: primary }, loading && { opacity: 0.65 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>SIGN IN</Text>}
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate('Register', { role })}>
            <Text style={s.linkGray}>New to UPahan?  </Text>
            <Text style={[s.linkColored, { color: primary }]}>SIGN UP</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity style={s.backRoleBtn} onPress={() => navigation.navigate('RoleSelect')}>
        <Text style={[s.backRoleText, { color: primary }]}>← Back to Role Select</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll:     { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, alignItems: 'center' },
  logoRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 },
  logoBox:    { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: 16, fontWeight: '800', color: COLORS.landlordPrimary, letterSpacing: 2 },
  badge:      { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 20 },
  badgeText:  { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  heading:    { fontSize: 32, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 10 },
  accentLine: { width: 40, height: 2, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12,
    marginBottom: 12, width: '100%',
  },
  errorText:  { flex: 1, fontSize: 13, color: COLORS.dangerPrimary },
  label: {
    alignSelf: 'flex-start', fontSize: 12, fontWeight: '600',
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, height: 52,
    paddingHorizontal: 14, marginBottom: 16, width: '100%',
    borderWidth: 1.5, borderColor: COLORS.borderLight,
  },
  inputIcon:  { marginRight: 10 },
  inputField: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  eyeBtn:     { padding: 4 },
  forgotRow:  { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  btn:        { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 2 },
  linkRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  linkGray:    { fontSize: 14, color: COLORS.textSecondary },
  linkColored: { fontSize: 14, fontWeight: '700' },
  backRoleBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.pageBg },
  backRoleText:{ fontSize: 13, fontWeight: '600' },
});
