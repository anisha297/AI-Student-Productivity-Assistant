import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppButton from '../components/AppButton';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!oldPassword) {
      setError('Current password is required');
      return;
    }
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    const result = await changePassword(oldPassword, newPassword, confirmPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Password changed successfully! Returning to settings...');
      setTimeout(() => {
        router.back();
      }, 1200);
    } else {
      setError(result.error || 'Failed to change password. Please verify current password.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.heading}>Change Password</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success Banner */}
            {successMessage ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {/* Current Password */}
              <TextInput
                label="Current Password"
                value={oldPassword}
                onChangeText={(t) => { setOldPassword(t); setError(''); }}
                mode="outlined"
                secureTextEntry={!showOld}
                autoCapitalize="none"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showOld ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowOld((v) => !v)}
                  />
                }
                style={styles.input}
              />

              {/* New Password */}
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(''); }}
                mode="outlined"
                secureTextEntry={!showNew}
                autoCapitalize="none"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-plus-outline" />}
                right={
                  <TextInput.Icon
                    icon={showNew ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowNew((v) => !v)}
                  />
                }
                style={styles.input}
              />

              {/* Confirm New Password */}
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                mode="outlined"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowConfirm((v) => !v)}
                  />
                }
                style={styles.input}
              />

              <AppButton
                label="Update Password"
                onPress={handleChangePassword}
                loading={loading}
                style={[styles.btnFull, { marginTop: SPACING.lg }]}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FF' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  scroll: { flexGrow: 1, padding: SPACING.lg },

  successBanner: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: FONT.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: FONT.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  form: { gap: SPACING.sm },
  input: { backgroundColor: '#FFFFFF', marginBottom: 2 },
  btnFull: { width: '100%' },
});
