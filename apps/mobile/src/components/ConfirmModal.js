import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function ConfirmModal({
  visible, title, icon, body,
  confirmLabel = 'CONFIRM', onConfirm, onCancel,
  danger = false,
}) {
  const confirmColor = danger ? COLORS.dangerPrimary : COLORS.landlordPrimary;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          {icon ? (
            <View style={[s.iconBox, { backgroundColor: danger ? COLORS.dangerLight : COLORS.landlordLight }]}>
              <Ionicons name={icon} size={28} color={confirmColor} />
            </View>
          ) : null}
          <Text style={s.title}>{title}</Text>
          {body ? <Text style={s.body}>{body}</Text> : null}
          <TouchableOpacity style={[s.btn, { backgroundColor: confirmColor }]} onPress={onConfirm}>
            <Text style={s.btnLabel}>{confirmLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
            <Text style={s.cancelLabel}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card:      { backgroundColor: '#fff', borderRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 24, alignItems: 'center', gap: 10 },
  iconBox:   { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title:     { fontSize: 20, fontWeight: '700', fontFamily: 'serif', color: '#1A1A1A', textAlign: 'center' },
  body:      { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  btn:       { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnLabel:  { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  cancelBtn: { width: '100%', height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E0DBD4' },
  cancelLabel: { color: '#666666', fontWeight: '600', fontSize: 14 },
});
