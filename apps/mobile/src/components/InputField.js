import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

export default function InputField({
  icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType = 'default',
  autoCapitalize = 'none', style, editable = true,
  onFocus, onBlur,
}) {
  const [showPw, setShowPw] = useState(false);
  const secure = secureTextEntry && !showPw;

  return (
    <View style={[s.wrap, !editable && s.disabled, style]}>
      {icon ? <Ionicons name={icon} size={18} color={COLORS.textMuted} style={s.icon} /> : null}
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {secureTextEntry ? (
        <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eye}>
          <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    height: LAYOUT.inputHeight,
    backgroundColor: COLORS.inputBg,
    borderRadius: LAYOUT.inputRadius,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  disabled: { backgroundColor: '#EBEBEB' },
  icon:     { marginRight: 10 },
  input:    { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  eye:      { padding: 4 },
});
