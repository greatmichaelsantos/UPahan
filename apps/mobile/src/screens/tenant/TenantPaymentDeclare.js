import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_ROUTES, getCurrentMonth, formatPeso } from '@upahan/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

const BLUE = COLORS.tenantPrimary;
const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const METHODS   = ['GCash', 'Maya', 'Bank Transfer', 'Cash', 'Other'];
const PAY_TYPES = [
  { value: 'full',    label: 'Full Payment' },
  { value: 'partial', label: 'Partial Payment' },
  { value: 'advance', label: 'Advance Payment' },
];

function formatDisplayMonth(ym) {
  if (!ym || ym.length < 7) return ym;
  const [y, m] = ym.split('-');
  const idx = parseInt(m, 10) - 1;
  if (idx < 0 || idx > 11) return ym;
  return `${MONTHS[idx]} ${y}`;
}

export default function TenantPaymentDeclare({ navigation, route }) {
  const { tenantInfo } = useAuth();
  const initialType = route.params?.initialType || 'full';
  const isPaid = initialType === 'advance';
  const [form, setForm] = useState({
    amount:       String(tenantInfo?.monthly_price || ''),
    method:       'GCash',
    paymentType:  initialType,
    monthCovered: getCurrentMonth(),
    notes:        '',
  });
  const [loading, setLoading]       = useState(false);
  const [proofImages, setProofImages] = useState([]);
  const [advanceMonths, setAdvanceMonths] = useState(1);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ amount: '', method: '', referenceNumber: '', proof: '' });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleTypeChange = (type) => {
    set('paymentType')(type);
    if (type === 'full') {
      set('amount')(String(Number(tenantInfo?.monthly_price || 0)));
    } else if (type === 'advance') {
      setAdvanceMonths(1);
      const multiplier = isPaid ? 1 : 2;
      set('amount')(String(Number(tenantInfo?.monthly_price || 0) * multiplier));
    } else {
      setAdvanceMonths(1);
    }
  };

  const handleAdvanceMonths = (n) => {
    setAdvanceMonths(n);
    const multiplier = isPaid ? n : n + 1;
    set('amount')(String(Number(tenantInfo?.monthly_price || 0) * multiplier));
  };

  const changeMonth = (delta) => {
    const [y, m] = form.monthCovered.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    set('monthCovered')(newVal);
  };

  const getAdvanceMonthCovered = (months) => {
    const now = new Date();
    const startOffset = isPaid ? 1 : 0;
    const startDate = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + months - 1, 1);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months === 1) return fmt(startDate);
    return `${fmt(startDate)} to ${fmt(endDate)}`;
  };

  const handlePickProofImages = async () => {
    if (proofImages.length >= 5) {
      Alert.alert('Maximum reached', 'You can attach up to 5 photos.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setProofImages(prev => [...prev, ...result.assets].slice(0, 5));
      setFieldErrors(e => ({ ...e, proof: '' }));
    }
  };

  const removeProofImage = (index) => {
    setProofImages(prev => prev.filter((_, i) => i !== index));
  };

  const requiresReference = form.method !== 'Cash';

  const handleSubmit = async () => {
    const errors = { amount: '', method: '', referenceNumber: '', proof: '' };
    let hasError = false;

    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0.';
      hasError = true;
    }
    if (requiresReference && !referenceNumber.trim()) {
      errors.referenceNumber = 'Reference number is required for this payment method.';
      hasError = true;
    }
    if (proofImages.length === 0) {
      errors.proof = 'Please attach at least one proof of payment.';
      hasError = true;
    }
    if (hasError) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({ amount: '', method: '', referenceNumber: '', proof: '' });

    const monthCovered = form.paymentType === 'advance'
      ? getAdvanceMonthCovered(advanceMonths)
      : getCurrentMonth();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('amountPaid', String(parseFloat(form.amount)));
      fd.append('paymentMethod', form.method);
      fd.append('paymentType', form.paymentType);
      fd.append('monthCovered', monthCovered);
      fd.append('paymentDate', new Date().toISOString().split('T')[0]);
      if (referenceNumber.trim()) fd.append('referenceNumber', referenceNumber.trim());
      if (form.notes.trim()) fd.append('notes', form.notes.trim());
      proofImages.forEach((img, i) => {
        const uriParts = img.uri.split('.');
        const ext = uriParts[uriParts.length - 1] || 'jpg';
        fd.append('proof_images', {
          uri: img.uri,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          name: img.fileName || `proof_${i}.${ext}`,
        });
      });
      await api.post(API_ROUTES.PAYMENT_DECLARE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Submitted!', 'Your payment declaration has been submitted for approval.', [
        { text: 'OK', onPress: () => navigation.navigate('TenantTabs', { screen: 'Payments' }) },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Submission failed.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={18} color={BLUE} />
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle}>Declare Payment</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {tenantInfo && (
          <View style={s.rentCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.rentLabel}>MONTHLY RENT</Text>
              <View style={s.declareBadge}>
                <Text style={s.declareBadgeText}>+ DECLARE</Text>
              </View>
            </View>
            <Text style={s.rentAmount}>{formatPeso(tenantInfo.monthly_price || 0)}</Text>
            <Text style={s.rentUnit}>
              {tenantInfo.unit_code ? `Unit ${tenantInfo.unit_code}` : ''}
            </Text>
          </View>
        )}

        {/* Payment Type — radio style */}
        <Text style={s.fieldLabel}>PAYMENT TYPE</Text>
        <View style={s.typeList}>
          {PAY_TYPES.map(t => {
            const active    = form.paymentType === t.value;
            const isForced  = initialType === 'advance' && t.value !== 'advance';
            return (
              <TouchableOpacity
                key={t.value}
                style={[s.typeItem, active && s.typeItemActive, isForced && { opacity: 0.4 }]}
                onPress={() => !isForced && handleTypeChange(t.value)}
                activeOpacity={isForced ? 1 : 0.75}
                disabled={isForced}
              >
                <View style={[s.typeRadio, active && s.typeRadioActive]}>
                  {active && <View style={s.typeRadioDot} />}
                </View>
                <Text style={[s.typeItemText, active && s.typeItemTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {form.paymentType === 'advance' && (
          <>
            <View style={s.monthMultiplierRow}>
              {[1, 2, 3, 4].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[s.monthBtn, advanceMonths === n && s.monthBtnActive]}
                  onPress={() => handleAdvanceMonths(n)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.monthBtnText, advanceMonths === n && s.monthBtnTextActive]}>
                    {n} {n === 1 ? 'Month' : 'Months'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.advanceHint}>
              <Text style={s.advanceHintText}>
                {isPaid
                  ? 'Paying in advance for future months'
                  : 'Includes current month (unpaid) + advance months'}
              </Text>
            </View>
          </>
        )}

        {form.paymentType === 'partial' && (
          <View style={s.partialHint}>
            <Text style={s.partialHintText}>
              Enter the amount you are paying now. You can submit another partial declaration after this one is approved.
            </Text>
          </View>
        )}

        <Text style={s.fieldLabel}>AMOUNT *</Text>
        <View style={[s.inputWrap, form.paymentType === 'full' && { backgroundColor: COLORS.inputBg, opacity: 0.7 }, fieldErrors.amount && s.inputWrapError]}>
          <Ionicons name="cash-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={s.inputField}
            value={form.amount}
            onChangeText={v => { set('amount')(v); setFieldErrors(e => ({ ...e, amount: '' })); }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            editable={form.paymentType !== 'full'}
          />
        </View>
        {fieldErrors.amount ? <Text style={s.inlineError}>{fieldErrors.amount}</Text> : null}

        <Text style={s.fieldLabel}>PAYMENT METHOD</Text>
        <View style={s.methodRow}>
          {METHODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[s.methodChip, form.method === m && s.methodChipActive]}
              onPress={() => { set('method')(m); setFieldErrors(e => ({ ...e, referenceNumber: '' })); }}
            >
              <Text style={[s.methodText, form.method === m && s.methodTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {requiresReference && (
          <>
            <Text style={s.fieldLabel}>REFERENCE NUMBER *</Text>
            <View style={[s.inputWrap, fieldErrors.referenceNumber && s.inputWrapError]}>
              <Ionicons name="receipt-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={s.inputField}
                value={referenceNumber}
                onChangeText={v => { setReferenceNumber(v); setFieldErrors(e => ({ ...e, referenceNumber: '' })); }}
                placeholder="e.g. GCash ref. number"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>
            {fieldErrors.referenceNumber ? <Text style={s.inlineError}>{fieldErrors.referenceNumber}</Text> : null}
          </>
        )}

        <Text style={s.fieldLabel}>NOTES <Text style={s.optional}>(optional)</Text></Text>
        <TextInput
          style={s.inputMulti}
          value={form.notes}
          onChangeText={set('notes')}
          placeholder="Reference number, remarks…"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* PROOF OF PAYMENT — required, up to 5 */}
        <View style={s.proofHeaderRow}>
          <Text style={s.fieldLabel}>PROOF OF PAYMENT *</Text>
          <Text style={s.photoCounter}>{proofImages.length}/5</Text>
        </View>
        {fieldErrors.proof ? <Text style={[s.inlineError, { marginTop: -4 }]}>{fieldErrors.proof}</Text> : null}

        {proofImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow}>
            {proofImages.map((img, i) => (
              <View key={i} style={s.thumbWrap}>
                <Image source={{ uri: img.uri }} style={s.proofThumb} resizeMode="cover" />
                <TouchableOpacity style={s.removeBtn} onPress={() => removeProofImage(i)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.dangerPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {proofImages.length < 5 && (
          <TouchableOpacity
            style={[s.uploadZone, fieldErrors.proof && s.uploadZoneError]}
            onPress={handlePickProofImages}
            activeOpacity={0.75}
          >
            <Ionicons name="cloud-upload-outline" size={28} color={fieldErrors.proof ? COLORS.dangerPrimary : BLUE} />
            <Text style={[s.uploadZoneMainText, fieldErrors.proof && { color: COLORS.dangerPrimary }]}>
              {proofImages.length === 0 ? 'Upload screenshot or receipt' : 'Add more photos'}
            </Text>
            <Text style={s.uploadZoneSubText}>JPG, PNG up to 5MB · at least 1 required</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[s.submitBtn, loading && { opacity: 0.65 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitText}>SUBMIT DECLARATION</Text>}
        </TouchableOpacity>

        <Text style={s.hint}>
          Your declaration will be reviewed by the admin before being marked as paid.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.pageBg },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText:  { fontSize: 13, color: BLUE, fontWeight: '500' },
  pageTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  scroll:    { padding: 20, paddingBottom: 48 },
  rentCard: {
    backgroundColor: BLUE, borderRadius: 16, padding: 22,
    marginBottom: 8,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  declareBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  declareBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.8 },
  rentLabel:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 6 },
  rentAmount: { fontSize: 36, fontFamily: 'Inter_800ExtraBold', color: '#fff', marginBottom: 4 },
  rentUnit:   { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: GOLD,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 16,
  },
  optional:  { fontWeight: '400', color: COLORS.textMuted, textTransform: 'none' },
  typeList:  { gap: 8 },
  typeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.borderLight,
  },
  typeItemActive: { borderLeftWidth: 4, borderLeftColor: BLUE, borderColor: COLORS.borderLight },
  typeRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  typeRadioActive: { borderColor: BLUE },
  typeRadioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: BLUE },
  typeItemText:       { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  typeItemTextActive: { color: BLUE, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12, height: 52, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  inputWrapError: { borderColor: COLORS.dangerPrimary, borderWidth: 1.5, backgroundColor: '#FEF2F2' },
  inlineError: { fontSize: 12, color: COLORS.dangerPrimary, marginTop: 4, marginBottom: 4 },
  inputField: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  monthPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, height: 52, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: BLUE,
  },
  monthChevron: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthDisplay: { fontSize: 16, fontWeight: '700', color: BLUE, fontFamily: 'Inter_700Bold' },
  inputMulti: {
    backgroundColor: COLORS.inputBg, borderRadius: 12, height: 100,
    paddingHorizontal: 14, paddingTop: 14, fontSize: 14, color: COLORS.textPrimary,
    textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.borderLight,
  },
  methodChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  methodText:       { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  methodTextActive: { color: '#fff', fontWeight: '700' },
  submitBtn: {
    backgroundColor: BLUE, height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  hint: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  proofHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  photoCounter: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  thumbRow: { marginBottom: 8 },
  thumbWrap: { position: 'relative', marginRight: 8 },
  proofThumb: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -8, right: -8 },
  uploadZone: {
    borderWidth: 2, borderColor: BLUE, borderStyle: 'dashed', borderRadius: 14,
    backgroundColor: '#F0F6FF', paddingVertical: 24,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  uploadZoneError: { borderColor: COLORS.dangerPrimary, backgroundColor: '#FEF2F2' },
  uploadZoneMainText: { fontSize: 14, fontWeight: '600', color: BLUE, marginTop: 4 },
  uploadZoneSubText:  { fontSize: 12, color: COLORS.textMuted },
  monthMultiplierRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  monthBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5,
    backgroundColor: '#FFFFFF', borderColor: '#4A90D9',
    alignItems: 'center', justifyContent: 'center',
  },
  monthBtnActive:     { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  monthBtnText:       { color: '#4A90D9', fontWeight: '700', fontSize: 12 },
  monthBtnTextActive: { color: '#FFFFFF' },
  partialHint: {
    backgroundColor: '#FFF8EC', borderRadius: 8, borderWidth: 1, borderColor: '#E07B39',
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
  },
  partialHintText: { fontSize: 12, color: '#E07B39', fontWeight: '500', lineHeight: 18 },
  advanceHint: {
    backgroundColor: '#EBF4FF', borderRadius: 8, borderWidth: 1, borderColor: '#4A90D9',
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
  },
  advanceHintText: { fontSize: 12, color: '#4A90D9', fontWeight: '500' },
});
