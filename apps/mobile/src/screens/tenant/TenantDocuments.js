import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, Linking, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { API_ROUTES, formatDate } from '@upahan/shared';
import api, { BASE_URL } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingScreen from '../../components/LoadingScreen';
import { COLORS } from '../../constants/colors';

const BLUE = COLORS.tenantPrimary;
const TEAL = COLORS.landlordPrimary;
const GOLD = COLORS.goldAccent;

export default function TenantDocuments({ navigation }) {
  const [documents, setDocuments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get(API_ROUTES.MY_DOCUMENTS);
      setDocuments(res.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchDocuments();
  }, [fetchDocuments]));

  const idDoc       = documents.find(d => d.document_type === 'valid_id');
  const contract    = documents.find(d => d.document_type === 'contract');
  const canSubmitId = !idDoc || idDoc.status === 'rejected';

  const pickAndUploadId = async (idType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      return Alert.alert('File Too Large', 'Maximum file size is 5MB.');
    }
    const mimeType = (asset.mimeType || asset.type || '').toLowerCase();
    if (mimeType && !['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
      return Alert.alert('Invalid File Type', 'Only JPG and PNG images are allowed.');
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('frontImage', { uri: asset.uri, type: 'image/jpeg', name: 'id_front.jpg' });
      fd.append('backImage',  { uri: asset.uri, type: 'image/jpeg', name: 'id_back.jpg' });
      fd.append('id_type', idType);
      await api.post(API_ROUTES.SUBMIT_ID, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Submitted!', 'Your ID has been submitted for review.');
      fetchDocuments();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Upload failed.');
    }
    setUploading(false);
  };

  const handleSubmitId = () => {
    Alert.alert(
      'Select ID Type',
      'Choose the type of valid ID you are submitting:',
      [
        { text: "Driver's License", onPress: () => pickAndUploadId("Driver's License") },
        { text: 'PhilSys ID',       onPress: () => pickAndUploadId('PhilSys ID') },
        { text: 'Passport',         onPress: () => pickAndUploadId('Passport') },
        { text: 'Postal ID',        onPress: () => pickAndUploadId('Postal ID') },
        { text: 'Other Gov\'t ID',  onPress: () => pickAndUploadId('Government ID') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) return <LoadingScreen color={BLUE} />;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={18} color={BLUE} />
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={s.pageTitle}>My Documents</Text>
        <Text style={s.pageSub}>Manage your identification and lease documents</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDocuments(); }}
            tintColor={TEAL}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Valid ID */}
        <Text style={s.sectionLabel}>VALID ID</Text>
        <View style={s.card}>
          <View style={s.docRow}>
            <View style={[s.docIcon, { backgroundColor: COLORS.tenantLight }]}>
              <Ionicons name="card-outline" size={20} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docTitle}>Valid ID</Text>
              <Text style={s.docSub}>Government-issued photo ID</Text>
            </View>
            {idDoc && <StatusBadge status={idDoc.status === 'under_review' ? 'under_review' : idDoc.status} />}
          </View>

          {idDoc ? (
            <>
              {idDoc.id_type && (
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>ID Type</Text>
                  <Text style={s.metaValue}>{idDoc.id_type}</Text>
                  {idDoc.created_at && (
                    <Text style={s.metaDate}>Submitted {formatDate(idDoc.created_at, 'medium')}</Text>
                  )}
                </View>
              )}

              {idDoc.status === 'under_review' && (
                <View style={[s.statusBox, { backgroundColor: COLORS.pendingBg, borderColor: COLORS.pendingText }]}>
                  <Text style={[s.statusBoxText, { color: COLORS.pendingText, fontWeight: '700' }]}>Under Review</Text>
                  <Text style={[s.statusBoxText, { color: COLORS.pendingText }]}>The landlord will verify your ID shortly.</Text>
                </View>
              )}

              {idDoc.status === 'verified' && (
                <View style={[s.statusBox, { backgroundColor: COLORS.landlordLight, borderColor: TEAL }]}>
                  <Text style={[s.statusBoxText, { color: TEAL, fontWeight: '700' }]}>✓ Verified by landlord</Text>
                </View>
              )}

              {idDoc.status === 'rejected' && (
                <View style={[s.statusBox, { backgroundColor: COLORS.dangerLight, borderColor: COLORS.dangerPrimary }]}>
                  <Text style={[s.statusBoxText, { color: COLORS.dangerPrimary, fontWeight: '700', marginBottom: 2 }]}>ID Rejected</Text>
                  {idDoc.rejection_reason && (
                    <Text style={[s.statusBoxText, { color: COLORS.dangerPrimary }]}>Reason: {idDoc.rejection_reason}</Text>
                  )}
                </View>
              )}

              {canSubmitId && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: BLUE }, uploading && { opacity: 0.6 }]}
                  onPress={handleSubmitId}
                  disabled={uploading}
                >
                  {uploading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <>
                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                        <Text style={s.actionBtnText}>
                          {idDoc.status === 'rejected' ? 'RESUBMIT ID' : 'SUBMIT ID'}
                        </Text>
                      </>}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={s.notSubmitted}>
                You haven't submitted a valid ID yet. Please upload your government-issued ID so the landlord can verify your identity.
              </Text>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: BLUE }, uploading && { opacity: 0.6 }]}
                onPress={handleSubmitId}
                disabled={uploading}
              >
                {uploading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                      <Text style={s.actionBtnText}>SUBMIT VALID ID</Text>
                    </>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Lease Contract */}
        <Text style={s.sectionLabel}>LEASE CONTRACT</Text>
        <View style={s.card}>
          <View style={s.docRow}>
            <View style={[s.docIcon, { backgroundColor: COLORS.landlordLight }]}>
              <Ionicons name="document-text-outline" size={20} color={TEAL} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docTitle}>Lease Contract</Text>
              <Text style={[s.docSub, { color: contract ? TEAL : COLORS.textMuted, fontWeight: contract ? '600' : '400' }]}>
                {contract ? '✓ Available' : 'Not yet uploaded by landlord'}
              </Text>
            </View>
            {contract && <StatusBadge status="verified" />}
          </View>

          {contract && (
            <>
              {(contract.contract_start_date || contract.contract_end_date) && (
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>Contract Period</Text>
                  <Text style={s.metaValue}>
                    {contract.contract_start_date ? formatDate(contract.contract_start_date, 'medium') : '—'}
                    {' – '}
                    {contract.contract_end_date ? formatDate(contract.contract_end_date, 'medium') : 'Ongoing'}
                  </Text>
                </View>
              )}
              {contract.contract_file && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: COLORS.landlordLight, borderWidth: 1.5, borderColor: TEAL }]}
                  onPress={() => Linking.openURL(`${BASE_URL}/uploads/documents/${contract.contract_file}`)}
                >
                  <Ionicons name="open-outline" size={16} color={TEAL} />
                  <Text style={[s.actionBtnText, { color: TEAL }]}>VIEW / DOWNLOAD CONTRACT</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={GOLD} />
          <Text style={s.disclaimerText}>
            Your documents are reviewed by the admin. Please ensure your ID is clear and legible.
          </Text>
        </View>
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
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { fontSize: 13, color: BLUE, fontWeight: '500' },
  pageTitle:{ fontSize: 26, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary },
  pageSub:  { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  scroll:   { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: GOLD,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 8,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  docRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  docIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  docSub:      { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notSubmitted:{ fontSize: 13, color: COLORS.textMuted, marginBottom: 14, lineHeight: 20 },
  metaBox: {
    backgroundColor: COLORS.pageBg, borderRadius: 10, padding: 12, marginBottom: 12,
  },
  metaLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  metaDate:  { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  statusBox: {
    borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 12,
  },
  statusBoxText: { fontSize: 13, lineHeight: 18 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: 999,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.infoBannerBg, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.infoBannerBorder,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: COLORS.textPrimary, lineHeight: 18 },
});
