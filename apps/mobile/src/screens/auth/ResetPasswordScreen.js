import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

const PASSWORD_CRITERIA = [
  { key: 'length',    label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter',  test: p => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter',  test: p => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number',            test: p => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordScreen({ route, navigation }) {
  const token   = route?.params?.token || '';
  const primary = COLORS.landlordPrimary;

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [done, setDone]                       = useState(false);

  const allMet = PASSWORD_CRITERIA.every(c => c.test(password));

  const handleSubmit = async () => {
    if (!password) { setError('Please enter a new password.'); return; }
    if (!allMet)   { setError('Password does not meet all requirements.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid or expired reset link.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Ionicons name="home" size={14} color={primary} />
            </View>
            <Text style={[s.logoText, { color: primary }]}>UPAHAN</Text>
          </View>

          <View style={[s.badge, { backgroundColor: primary }]}>
            <Text style={s.badgeText}>RESET PASSWORD</Text>
          </View>

          <Text style={s.heading}>New Password</Text>
          <View style={[s.gold, { backgroundColor: primary }]} />

          {done ? (
            <>
              <View style={s.successBox}>
                <Ionicons name="checkmark-circle-outline" size={15} color="#2E7D32" />
                <Text style={s.successText}>Password reset! You may now log in with your new password.</Text>
              </View>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: primary, marginTop: 16 }]}
                onPress={() => navigation.navigate('Login', {})}
                activeOpacity={0.85}
              >
                <Text style={s.btnText}>GO TO LOGIN</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {error ? (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle-outline" size={15} color={COLORS.dangerPrimary} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={s.label}>New Password *</Text>
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

              {password.length > 0 && (
                <View style={s.criteriaGrid}>
                  {PASSWORD_CRITERIA.map(c => {
                    const met = c.test(password);
                    return (
                      <View key={c.key} style={s.criteriaItem}>
                        <Ionicons
                          name={met ? 'checkmark-circle' : 'ellipse-outline'}
                          size={13}
                          color={met ? primary : COLORS.textMuted}
                        />
                        <Text style={[s.criteriaText, met && { color: primary, fontWeight: '600' }]}>
                          {c.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <Text style={s.label}>Confirm Password *</Text>
              <View style={s.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#888" style={s.inputIcon} />
                <TextInput
                  style={s.inputField}
                  placeholder="••••••••"
                  placeholderTextColor="#AAA"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setError(''); }}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={s.eyeBtn}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={s.mismatchText}>Passwords do not match</Text>
              )}
              {confirmPassword.length > 0 && confirmPassword === password && password.length > 0 && (
                <Text style={s.matchText}>Passwords match</Text>
              )}

              <TouchableOpacity
                style={[s.btn, { backgroundColor: primary, marginTop: 24 }, loading && { opacity: 0.65 }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>RESET PASSWORD</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:       { padding: 24, paddingBottom: 40, alignItems: 'center' },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, alignSelf: 'flex-start' },
  logoBox:      { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  logoText:     { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  badge:        { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  heading:      { fontSize: 32, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 10 },
  gold:         { width: 40, height: 2, marginBottom: 20 },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  errorText:    { flex: 1, fontSize: 13, color: COLORS.dangerPrimary },
  successBox:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  successText:  { flex: 1, fontSize: 13, color: '#2E7D32' },
  label:        { alignSelf: 'flex-start', fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, height: 52, paddingHorizontal: 14, marginBottom: 16, width: '100%', borderWidth: 1.5, borderColor: COLORS.borderLight },
  inputIcon:    { marginRight: 10 },
  inputField:   { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  eyeBtn:       { padding: 4 },
  criteriaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -4, marginBottom: 8, width: '100%' },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, width: '48%' },
  criteriaText: { fontSize: 11, color: COLORS.textMuted },
  mismatchText: { fontSize: 12, color: COLORS.dangerPrimary, marginTop: -10, marginBottom: 8, alignSelf: 'flex-start' },
  matchText:    { fontSize: 12, color: '#2E7D32', marginTop: -10, marginBottom: 8, alignSelf: 'flex-start' },
  btn:          { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 2 },
});
