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
import { router, useLocalSearchParams } from 'expo-router';
import AppButton from '../components/AppButton';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState(params.initialCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!code.trim()) {
      setError('6-digit verification code is required');
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
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, code, newPassword, confirmPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } else {
      setError(result.error || 'Failed to reset password. Please verify the code.');
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
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <Text style={styles.iconEmoji}>🔒</Text>
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the verification code sent to your email and set your new password.
              </Text>
            </View>

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

            {/* ── Form ──────────────────────────────────────── */}
            <View style={styles.form}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
              />

              <TextInput
                label="6-Digit Reset Code"
                value={code}
                onChangeText={(t) => { setCode(t); setError(''); }}
                mode="outlined"
                keyboardType="number-pad"
                maxLength={6}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="shield-key-outline" />}
                style={styles.input}
              />

              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(''); }}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
                style={styles.input}
              />

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
                label="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                style={[styles.btnFull, { marginTop: SPACING.md }]}
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
  scroll: { flexGrow: 1, padding: SPACING.lg },

  back: { marginBottom: SPACING.md },
  backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '600' },

  header: { alignItems: 'center', marginBottom: SPACING.xl },
  iconBadge: {
    width: 72,
    height: 72,
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconEmoji: { fontSize: 34 },
  title: { fontSize: FONT.xxxl, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: FONT.md, color: '#64748B', textAlign: 'center', lineHeight: 22 },

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

  form: { gap: SPACING.xs },
  input: { backgroundColor: '#FFFFFF', marginBottom: 2 },
  btnFull: { width: '100%' },
});
