import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_ROUTES } from '@upahan/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

const BLUE = COLORS.tenantPrimary;
const GOLD = COLORS.goldAccent;

export default function TenantProfile({ navigation }) {
  const { user, tenantInfo, logout, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.first_name   || '',
    lastName:  user?.last_name    || '',
    phone:     user?.phone_number || '',
  });
  const [original]                         = useState({ ...form });
  const [pwForm, setPwForm]               = useState({ current: '', newPw: '', confirm: '' });
  const [showPwSection, setShowPwSection] = useState(false);
  const [savingProfile, setSavingProfile]     = useState(false);
  const [savingPw, setSavingPw]               = useState(false);
  const [saveSuccess, setSaveSuccess]         = useState('');
  const [saveError, setSaveError]             = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const set   = (key) => (val) => { setForm(f => ({ ...f, [key]: val })); setSaveSuccess(''); setSaveError(''); };
  const setPw = (key) => (val) => setPwForm(f => ({ ...f, [key]: val }));

  const isDirty = form.firstName !== original.firstName ||
                  form.lastName  !== original.lastName  ||
                  form.phone     !== original.phone;

  const handleSaveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setSaveError('First and last name are required.');
    }
    setSavingProfile(true);
    setSaveError('');
    try {
      await api.put(API_ROUTES.USER_ME, {
        first_name:   form.firstName.trim(),
        last_name:    form.lastName.trim(),
        phone_number: form.phone.trim(),
      });
      updateUser({
        first_name:   form.firstName.trim(),
        last_name:    form.lastName.trim(),
        phone_number: form.phone.trim(),
      });
      setSaveSuccess('Profile updated successfully.');
    } catch (e) {
      setSaveError(e.response?.data?.message || 'Update failed.');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) return Alert.alert('Required', 'Fill in all password fields.');
    if (pwForm.newPw !== pwForm.confirm)  return Alert.alert('Mismatch', 'New passwords do not match.');
    if (pwForm.newPw.length < 6)          return Alert.alert('Too short', 'Password must be at least 6 characters.');
    setSavingPw(true);
    try {
      await api.put(API_ROUTES.USER_ME_PASSWORD, {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPwSection(false);
      Alert.alert('Updated', 'Password changed successfully.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Password change failed.');
    }
    setSavingPw(false);
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'T';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar header */}
        <View style={s.avatarHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.avatarName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={s.avatarEmail}>{user?.email}</Text>
        </View>

        {/* Personal Information */}
        <Text style={s.sectionLabel}>PERSONAL INFORMATION</Text>
        <View style={s.card}>
          <FieldLabel>First Name</FieldLabel>
          <TextInput style={s.input} value={form.firstName} onChangeText={set('firstName')} autoCapitalize="words" placeholderTextColor={COLORS.textMuted} />
          <FieldLabel>Last Name</FieldLabel>
          <TextInput style={s.input} value={form.lastName} onChangeText={set('lastName')} autoCapitalize="words" placeholderTextColor={COLORS.textMuted} />
          <FieldLabel>Phone Number</FieldLabel>
          <TextInput style={s.input} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="09XXXXXXXXX" placeholderTextColor={COLORS.textMuted} maxLength={11} />
          <FieldLabel>Email Address <Text style={s.locked}>(locked)</Text></FieldLabel>
          <View style={[s.input, s.inputReadOnly]}>
            <Text style={s.readOnlyText}>{user?.email}</Text>
          </View>

          {saveError ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{saveError}</Text>
            </View>
          ) : null}
          {saveSuccess ? (
            <View style={s.successBox}>
              <Text style={s.successText}>{saveSuccess}</Text>
            </View>
          ) : null}

          {isDirty && (
            <TouchableOpacity
              style={[s.saveBtn, savingProfile && { opacity: 0.65 }]}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBtnText}>SAVE CHANGES</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* My Documents */}
        <Text style={s.sectionLabel}>MY DOCUMENTS</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={[s.menuRow, { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, paddingBottom: 14 }]}
            onPress={() => navigation?.navigate('TenantDocuments', { type: 'id' })}
          >
            <View style={[s.menuIcon, { backgroundColor: COLORS.tenantLight }]}>
              <Ionicons name="id-card-outline" size={18} color={BLUE} />
            </View>
            <Text style={s.menuLabel}>Valid ID</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.menuRow, { marginTop: 4 }]}
            onPress={() => navigation?.navigate('TenantDocuments', { type: 'contract' })}
          >
            <View style={[s.menuIcon, { backgroundColor: COLORS.tenantLight }]}>
              <Ionicons name="document-text-outline" size={18} color={BLUE} />
            </View>
            <Text style={s.menuLabel}>Lease Contract</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={[s.menuRow, { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, paddingBottom: 14 }]}
            onPress={() => setShowPwSection(v => !v)}
          >
            <View style={[s.menuIcon, { backgroundColor: COLORS.tenantLight }]}>
              <Ionicons name="lock-closed-outline" size={18} color={BLUE} />
            </View>
            <Text style={s.menuLabel}>Change Password</Text>
            <Ionicons name={showPwSection ? 'chevron-up' : 'chevron-forward'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {showPwSection && (
            <View style={{ paddingTop: 14, gap: 10 }}>
              <PwField label="Current Password" value={pwForm.current} onChange={setPw('current')} />
              <PwField label="New Password"     value={pwForm.newPw}   onChange={setPw('newPw')} />
              <PwField label="Confirm New"      value={pwForm.confirm} onChange={setPw('confirm')} />
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: BLUE }, savingPw && { opacity: 0.65 }]}
                onPress={handleChangePassword}
                disabled={savingPw}
              >
                {savingPw
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.saveBtnText}>UPDATE PASSWORD</Text>}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[s.menuRow, { marginTop: 4 }]}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={[s.menuIcon, { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.dangerPrimary} />
            </View>
            <Text style={[s.menuLabel, { color: COLORS.dangerPrimary }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <Ionicons name="log-out-outline" size={28} color="#D32F2F" />
            </View>
            <Text style={s.modalTitle}>Log Out?</Text>
            <Text style={s.modalMessage}>Are you sure you want to log out?</Text>
            <TouchableOpacity
              style={s.logoutBtn}
              onPress={() => { setShowLogoutModal(false); logout(); }}
            >
              <Text style={s.logoutBtnText}>LOG OUT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={s.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FieldLabel({ children }) {
  return <Text style={fieldLabelStyle}>{children}</Text>;
}
const fieldLabelStyle = {
  fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 10,
};

function PwField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <Text style={fieldLabelStyle}>{label}</Text>
      <View style={pw.wrap}>
        <TextInput
          style={pw.input}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          autoCapitalize="none"
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity style={pw.eye} onPress={() => setShow(v => !v)}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pw = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary,
  },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12 },
});

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:{ paddingBottom: 48 },
  avatarHeader: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, alignItems: 'center',
  },
  avatar:     { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.tenantPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: COLORS.tenantPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  avatarName: { fontSize: 20, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary, marginBottom: 4 },
  avatarEmail:{ fontSize: 13, color: COLORS.textSecondary },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: GOLD,
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginLeft: 20, marginBottom: 10, marginTop: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  input: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: COLORS.textPrimary, marginBottom: 2,
  },
  inputReadOnly: { backgroundColor: COLORS.pageBg, borderColor: COLORS.borderLight, justifyContent: 'center' },
  readOnlyText:  { fontSize: 14, color: COLORS.textSecondary },
  locked:        { fontWeight: '400', color: COLORS.textMuted },
  errorBox:      { backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 10, marginTop: 10 },
  errorText:     { fontSize: 13, color: COLORS.dangerPrimary },
  successBox:    { backgroundColor: COLORS.landlordLight, borderRadius: 10, padding: 10, marginTop: 10 },
  successText:   { fontSize: 13, color: COLORS.landlordPrimary, fontWeight: '600' },
  saveBtn:       { backgroundColor: COLORS.tenantPrimary, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  saveBtnText:   { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  menuRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard:     { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '80%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  modalIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle:    { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  modalMessage:  { fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 },
  logoutBtn:     { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#D32F2F', alignItems: 'center', marginBottom: 10 },
  logoutBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  cancelBtn:     { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
  cancelBtnText: { color: '#666666', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
});
