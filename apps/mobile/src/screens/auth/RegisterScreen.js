import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import { COLORS } from '../../constants/colors';

const NAME_REGEX  = /^[A-Za-z\s'\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_CRITERIA = [
  { key: 'length',    label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter',  test: p => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter',  test: p => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number',            test: p => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterScreen({ route, navigation }) {
  const role       = route?.params?.role || 'tenant';
  const isAdmin    = role === 'admin';
  const primary    = isAdmin ? COLORS.landlordPrimary : COLORS.tenantPrimary;
  const badgeLabel = isAdmin ? 'NEW LANDLORD' : 'NEW TENANT';

  const { register } = useAuth();
  const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (route.params?.agreed) {
      setTermsAgreed(true);
    }
  }, [route.params?.agreed]);

  const set = key => val => { setForm(f => ({ ...f, [key]: val })); setError(''); };

  const firstNameErr     = form.firstName.length > 0 && !NAME_REGEX.test(form.firstName) ? 'Only letters, spaces, and hyphens allowed' : '';
  const lastNameErr      = form.lastName.length > 0 && !NAME_REGEX.test(form.lastName) ? 'Only letters, spaces, and hyphens allowed' : '';
  const emailFormatErr   = form.email.length >= 5 && form.email.includes('@') && !EMAIL_REGEX.test(form.email) ? 'Invalid email address' : '';

  const handleRegister = async () => {
    const { firstName, lastName, phone, email, password } = form;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.'); return;
    }
    if (firstName.trim().length < 2) { setError('First name must be at least 2 characters.'); return; }
    if (!NAME_REGEX.test(firstName))  { setError('First name must contain letters only.'); return; }
    if (lastName.trim().length < 2)   { setError('Last name must be at least 2 characters.'); return; }
    if (!NAME_REGEX.test(lastName))   { setError('Last name must contain letters only.'); return; }
    if (!EMAIL_REGEX.test(email))     { setError('Please enter a valid email address.'); return; }
    if (phone && (phone.length !== 11 || !phone.startsWith('09'))) {
      setError('Phone must be 11 digits starting with 09.'); return;
    }
    if (!PASSWORD_CRITERIA.every(c => c.test(password))) {
      setError('Password does not meet all requirements.'); return;
    }
    if (password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    setError('');
    const result = await register({
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      phoneNumber: phone.trim(),
      email:       email.trim().toLowerCase(),
      password,
      role,
    });
    setLoading(false);
    if (result.success) {
      Alert.alert(
        'Check Your Email',
        result.message || 'Registration successful! Please check your email to verify your account before logging in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login', { role }) }]
      );
    } else {
      setError(result.message);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.brandRow}>
            <View style={[s.houseBox, { backgroundColor: isAdmin ? COLORS.landlordLight : '#E3F0FB' }]}>
              <Ionicons name="home" size={14} color={primary} />
            </View>
            <Text style={[s.brandText, { color: primary }]}>UPAHAN</Text>
          </View>

          <View style={[s.badge, { backgroundColor: primary }]}>
            <Text style={s.badgeText}>{badgeLabel}</Text>
          </View>

          <Text style={s.heading}>Create Account</Text>
          <View style={[s.gold, { backgroundColor: primary }]} />
          <Text style={s.headingSub}>Join Upahan to manage your property easily.</Text>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.dangerPrimary} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>First Name *</Text>
              <InputField
                placeholder="First" value={form.firstName}
                onChangeText={set('firstName')} autoCapitalize="words"
                style={firstNameErr ? s.inputError : undefined}
              />
              {firstNameErr ? <Text style={s.fieldErr}>{firstNameErr}</Text> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Last Name *</Text>
              <InputField
                placeholder="Last" value={form.lastName}
                onChangeText={set('lastName')} autoCapitalize="words"
                style={lastNameErr ? s.inputError : undefined}
              />
              {lastNameErr ? <Text style={s.fieldErr}>{lastNameErr}</Text> : null}
            </View>
          </View>

          <Text style={s.label}>Phone Number</Text>
          <InputField
            icon="call-outline" placeholder="09XXXXXXXXX" value={form.phone}
            onChangeText={t => set('phone')(t.replace(/\D/g, '').slice(0, 11))}
            keyboardType="phone-pad"
          />

          <Text style={s.label}>Email Address *</Text>
          <InputField
            icon="mail-outline" placeholder="you@example.com"
            value={form.email} onChangeText={set('email')} keyboardType="email-address"
            style={emailFormatErr ? s.inputError : undefined}
          />
          {emailFormatErr ? <Text style={s.fieldErr}>{emailFormatErr}</Text> : null}

          <Text style={s.label}>Password *</Text>
          <InputField icon="lock-closed-outline" placeholder="••••••••" value={form.password} onChangeText={set('password')} secureTextEntry />

          {form.password.length > 0 && (
            <View style={s.criteriaGrid}>
              {PASSWORD_CRITERIA.map(c => {
                const met = c.test(form.password);
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
          <InputField icon="lock-closed-outline" placeholder="••••••••" value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry />
          {form.confirmPassword.length > 0 && form.confirmPassword !== form.password && (
            <Text style={s.mismatchText}>Passwords do not match</Text>
          )}
          {form.confirmPassword.length > 0 && form.confirmPassword === form.password && form.password.length > 0 && (
            <Text style={s.matchText}>Passwords match</Text>
          )}

          {/* T&C checkbox row */}
          <TouchableOpacity
            style={s.termsRow}
            onPress={() => navigation.navigate('TermsAndConditions', { role })}
            activeOpacity={0.7}
          >
            <Ionicons
              name={termsAgreed ? 'checkbox' : 'square-outline'}
              size={20}
              color={termsAgreed ? primary : COLORS.textSecondary}
            />
            <Text style={s.termsText}>
              I have read and agree to the{' '}
              <Text style={[s.termsLink, { color: primary }]}>Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, { backgroundColor: primary }, (!termsAgreed || loading) && { opacity: 0.5 }]}
            onPress={handleRegister}
            disabled={!termsAgreed || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>COMPLETE REGISTRATION</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate('Login', { role })}>
            <Text style={s.linkGray}>Already have an account?  </Text>
            <Text style={[s.linkColored, { color: primary }]}>LOG IN</Text>
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
  safe:        { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:      { padding: 24, paddingBottom: 40, alignItems: 'center' },
  brandRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, alignSelf: 'flex-start' },
  houseBox:    { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  brandText:   { fontSize: 15, fontWeight: '800', color: COLORS.landlordPrimary, letterSpacing: 2 },
  badge:       { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20 },
  badgeText:   { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  heading:     { fontSize: 32, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 10 },
  gold:        { width: 40, height: 2, marginBottom: 10 },
  headingSub:  { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  errorBox:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  errorText:   { flex: 1, fontSize: 13, color: COLORS.dangerPrimary },
  nameRow:     { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 0 },
  label:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 14, alignSelf: 'flex-start', width: '100%' },
  inputError:   { borderColor: COLORS.dangerPrimary, borderWidth: 1, backgroundColor: '#FEF2F2' },
  fieldErr:     { fontSize: 11, color: COLORS.dangerPrimary, marginTop: 4, alignSelf: 'flex-start' },
  criteriaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, width: '100%' },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, width: '48%' },
  criteriaText: { fontSize: 11, color: COLORS.textMuted },
  mismatchText: { fontSize: 12, color: COLORS.dangerPrimary, marginTop: 5, alignSelf: 'flex-start' },
  matchText:    { fontSize: 12, color: '#2E7D32', marginTop: 5, alignSelf: 'flex-start' },
  termsRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%', marginTop: 20, marginBottom: 4 },
  termsText:   { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  termsLink:   { fontWeight: '700' },
  btn:         { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 16 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1.5 },
  linkRow:     { flexDirection: 'row', alignItems: 'center' },
  linkGray:    { fontSize: 14, color: COLORS.textSecondary },
  linkColored: { fontSize: 14, fontWeight: '700' },
  backRoleBtn:  { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.pageBg },
  backRoleText: { fontSize: 13, fontWeight: '600' },
});
