import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_ROUTES, MAINTENANCE_CATEGORIES } from '@upahan/shared';
import api from '../../api/client';
import { COLORS } from '../../constants/colors';

const BLUE = COLORS.tenantPrimary;
const GOLD = COLORS.goldAccent;

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: COLORS.textMuted },
  { value: 'medium', label: 'Medium', color: '#E07B39' },
  { value: 'high',   label: 'High',   color: COLORS.dangerPrimary },
];

export default function TenantMaintenanceRequest({ navigation }) {
  const [category, setCategory] = useState('');
  const [subject, setSubject]   = useState('');
  const [description, setDesc]  = useState('');
  const [priority, setPriority] = useState('low');
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) setPhotos(prev => [...prev, ...result.assets]);
  };

  const handleSubmit = async () => {
    if (!category) return Alert.alert('Required', 'Please select an issue category.');
    if (!subject.trim()) return Alert.alert('Required', 'Please enter a subject.');
    setLoading(true);
    try {
      const res = await api.post(API_ROUTES.MAINTENANCE, {
        issueCategory: category,
        subject:       subject.trim(),
        description:   description.trim(),
        priorityLevel: priority,
      });
      if (photos.length > 0) {
        const requestId = res.data.data?.request_id;
        if (requestId) {
          const fd = new FormData();
          photos.forEach(p => fd.append('photos', { uri: p.uri, type: 'image/jpeg', name: 'photo.jpg' }));
          await api.post(API_ROUTES.maintenancePhotos(requestId), fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }
      Alert.alert('Submitted!', 'Your maintenance request has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
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
        <Text style={s.pageTitle}>New Request</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.fieldLabel}>ISSUE CATEGORY *</Text>
        <View style={s.chipGrid}>
          {MAINTENANCE_CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[s.chip, category === c.value && s.chipActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={[s.chipText, category === c.value && s.chipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.fieldLabel}>PRIORITY</Text>
        <View style={s.priorityRow}>
          {PRIORITIES.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[
                s.priorityChip,
                priority === p.value && { backgroundColor: p.color, borderColor: p.color },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <Text style={[s.priorityText, priority === p.value && { color: '#fff' }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.fieldLabel}>SUBJECT *</Text>
        <View style={s.inputWrap}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={s.inputField}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of the issue"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <Text style={s.fieldLabel}>DETAILS <Text style={s.optional}>(optional)</Text></Text>
        <TextInput
          style={s.inputMulti}
          value={description}
          onChangeText={setDesc}
          placeholder="Explain the issue in more detail…"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={s.fieldLabel}>PHOTOS <Text style={s.optional}>(optional)</Text></Text>
        <TouchableOpacity style={s.uploadZone} onPress={pickPhoto}>
          <View style={s.uploadIconWrap}>
            <Ionicons name="camera-outline" size={28} color={BLUE} />
          </View>
          <Text style={s.uploadLabel}>Tap to add photos</Text>
          {photos.length > 0 && (
            <Text style={s.uploadSub}>{photos.length} photo{photos.length > 1 ? 's' : ''} selected</Text>
          )}
        </TouchableOpacity>

        {photos.length > 0 && (
          <View style={s.photoRow}>
            {photos.map((p, i) => (
              <View key={i} style={s.photoThumb}>
                <Image source={{ uri: p.uri }} style={s.thumbImg} />
                <TouchableOpacity
                  style={s.removePhoto}
                  onPress={() => setPhotos(ps => ps.filter((_, j) => j !== i))}
                >
                  <Ionicons name="close-circle" size={22} color={COLORS.dangerPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[s.submitBtn, loading && { opacity: 0.65 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitText}>SUBMIT REQUEST</Text>}
        </TouchableOpacity>
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
  pageTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary },
  scroll:    { padding: 20, paddingBottom: 48 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: GOLD,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 16,
  },
  optional:  { fontWeight: '400', color: COLORS.textMuted, textTransform: 'none' },
  chipGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.borderLight },
  chipActive:     { backgroundColor: BLUE, borderColor: BLUE },
  chipText:       { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  priorityRow:    { flexDirection: 'row', gap: 8 },
  priorityChip: {
    flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.borderLight, backgroundColor: '#fff',
  },
  priorityText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12, height: 52, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  inputField: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  inputMulti: {
    backgroundColor: COLORS.inputBg, borderRadius: 12, height: 100,
    paddingHorizontal: 14, paddingTop: 14, fontSize: 14, color: COLORS.textPrimary,
    textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  uploadZone: {
    borderWidth: 1.5, borderColor: BLUE, borderStyle: 'dashed',
    borderRadius: 16, backgroundColor: COLORS.tenantLight,
    padding: 24, alignItems: 'center', gap: 8, marginBottom: 12,
  },
  uploadIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: BLUE },
  uploadSub:   { fontSize: 12, color: BLUE },
  photoRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  photoThumb:  { position: 'relative' },
  thumbImg:    { width: 76, height: 76, borderRadius: 10 },
  removePhoto: { position: 'absolute', top: -8, right: -8 },
  submitBtn: {
    backgroundColor: BLUE, height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
});
