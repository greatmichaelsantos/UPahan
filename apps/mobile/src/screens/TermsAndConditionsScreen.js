import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const TENANT_SUMMARY = [
  'Your rent payments are tracked and recorded digitally.',
  'You can submit maintenance requests anytime through the app.',
  'Your personal information is only visible to your landlord.',
  'Payment records are kept for your protection.',
  'You must keep your account information accurate and up to date.',
];

const LANDLORD_SUMMARY = [
  'You are responsible for managing units, tenants, and payments.',
  'Approving a payment means you confirm receipt of funds.',
  'Tenant personal data must be kept private and secure.',
  'You can manage all units and assign or remove tenants anytime.',
  'Maintenance requests must be reviewed and updated promptly.',
];

const TENANT_SECTIONS = [
  {
    heading: 'What is UPahan?',
    body: 'UPahan is a rental management app made for tenants of RGT Real Estate Marketing. We built it to make your renting experience easier — you can track your payments, submit maintenance requests, and access your documents all in one place.',
  },
  {
    heading: 'Your responsibilities as a tenant',
    body: 'Pay your rent on time. Submit maintenance requests honestly — only report real issues. Keep your account information accurate, including your name, contact number, and valid ID.',
  },
  {
    heading: 'Rent and payment tracking',
    body: 'When you declare a payment, your landlord reviews and verifies it. This keeps your payment records transparent and accurate. All verified payments are saved so you always have a record.',
  },
  {
    heading: 'Maintenance requests',
    body: 'You can submit a maintenance request anytime through the app. Submitting a request does not guarantee an immediate repair. Your landlord will review it and update the status as things progress.',
  },
  {
    heading: 'Your personal information',
    body: 'We store your name, contact details, valid ID, and lease information securely. Only your landlord can see your personal data. We do not share it with anyone else.',
  },
  {
    heading: 'Your rights',
    body: 'You can update your profile and change your password anytime. You can also contact your landlord directly through the app. Your data and records are always available to you.',
  },
  {
    heading: 'Changes to these terms',
    body: 'We may update these Terms and Conditions from time to time. If we make changes, we will let you know through the app. Continued use means you accept the updated terms.',
  },
  {
    heading: 'Questions?',
    body: 'If you have any questions or concerns, please contact RGT Real Estate Marketing directly. We are here to help.',
  },
];

const LANDLORD_SECTIONS = [
  {
    heading: 'What is UPahan?',
    body: 'UPahan is a rental management platform built for landlords of RGT Real Estate Marketing. It helps you manage your units, track tenant payments, handle maintenance requests, and keep everything organized in one place.',
  },
  {
    heading: 'Your responsibilities as a landlord',
    body: 'Keep all unit information accurate and up to date. Respond to tenant maintenance requests in a timely manner. Approve or reject payment declarations honestly based on actual receipt of funds.',
  },
  {
    heading: 'Managing units and tenants',
    body: 'You are responsible for assigning tenants to the correct units. Keep unit statuses updated — vacant, occupied, or under maintenance. Accurate information protects both you and your tenants.',
  },
  {
    heading: 'Payment verification',
    body: 'Approving a payment declaration means you confirm you have received the funds. Only reject a declaration if there is a valid reason. Always act honestly when reviewing payments.',
  },
  {
    heading: 'Tenant data and privacy',
    body: 'Tenant personal information is entrusted to you through this platform. Do not share or misuse it. Handle all tenant data with care and in accordance with applicable privacy laws.',
  },
  {
    heading: 'Your rights',
    body: 'You can manage all your units and assign or remove tenants anytime. You can update your profile, change your password, and view the full payment history for all tenants.',
  },
  {
    heading: 'Changes to these terms',
    body: 'We may update these Terms and Conditions from time to time. If we make changes, we will notify you through the app. Continued use of the platform means you accept the updated terms.',
  },
  {
    heading: 'Questions?',
    body: 'If you have any system concerns or questions about the platform, please contact the UPahan development team. We are happy to help.',
  },
];

export default function TermsAndConditionsScreen({ route, navigation }) {
  const { role } = route.params;
  const isTenant  = role === 'tenant';
  const primary   = isTenant ? COLORS.tenantPrimary : COLORS.landlordPrimary;
  const summaryBg = isTenant ? '#EBF4FF' : '#E6F0F0';
  const summaryBd = isTenant ? '#4A90D9' : '#277571';
  const summary   = isTenant ? TENANT_SUMMARY : LANDLORD_SUMMARY;
  const sections  = isTenant ? TENANT_SECTIONS : LANDLORD_SECTIONS;

  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 32) {
      setScrolledToBottom(true);
    }
  };

  const handleAgree = () => {
    navigation.navigate('Register', { role, agreed: true });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms and Conditions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        {/* Summary card */}
        <View style={[s.summaryCard, { backgroundColor: summaryBg, borderColor: summaryBd }]}>
          <View style={s.summaryLabelRow}>
            <Ionicons name="star" size={14} color={COLORS.goldAccent} />
            <Text style={s.summaryLabel}>HERE IS WHAT YOU ARE AGREEING TO</Text>
          </View>
          {summary.map((point, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={[s.bullet, { backgroundColor: primary }]} />
              <Text style={s.bulletText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        {sections.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={[s.sectionHeading, { color: primary }]}>{sec.heading}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {!scrolledToBottom && (
        <View style={s.hintRow}>
          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
          <Text style={s.hintText}>Scroll down to read all terms before accepting</Text>
        </View>
      )}

      <View style={s.actions}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.agreeBtn, { backgroundColor: scrolledToBottom ? primary : '#CCCCCC' }]}
          onPress={handleAgree}
          disabled={!scrolledToBottom}
          activeOpacity={0.85}
        >
          <Text style={s.agreeText}>I Agree</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pageBg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    backgroundColor: '#fff',
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },

  scroll:        { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 12 },

  summaryCard: {
    borderRadius: 12, borderWidth: 1.5, padding: 16, marginBottom: 24,
  },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  summaryLabel:    { fontSize: 11, fontWeight: '700', color: COLORS.goldAccent, letterSpacing: 1, textTransform: 'uppercase' },
  bulletRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  bullet:     { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },

  section:        { marginBottom: 20 },
  sectionHeading: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sectionBody:    { fontSize: 14, color: '#666666', lineHeight: 22 },

  hintRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, backgroundColor: COLORS.pageBg },
  hintText: { fontSize: 12, color: COLORS.textMuted },

  actions:   { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: '#fff' },
  cancelBtn: { flex: 1, height: 50, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.textSecondary, alignItems: 'center', justifyContent: 'center' },
  cancelText:{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  agreeBtn:  { flex: 2, height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  agreeText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});
