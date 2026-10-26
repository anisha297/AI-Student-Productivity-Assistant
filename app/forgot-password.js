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
import { router } from 'expo-router';
import AppButton from '../components/AppButton';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { forgotPassword } = useAuth();

  const handleSendCode = async () => {
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      // Navigate to reset password after brief pause
      setTimeout(() => {
        router.push({
          pathname: '/reset-password',
          params: { email: email.trim().toLowerCase(), initialCode: result.code || '' },
        });
      }, 1200);
    } else {
      setError(result.error || 'Failed to request reset code. Please check your email.');
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
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <Text style={styles.iconEmoji}>🔑</Text>
              </View>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email address to receive a 6-digit verification code.
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
                label="Registered Email Address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                outlineColor={error ? COLORS.danger : COLORS.border}
                activeOutlineColor={error ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
              />

              <AppButton
                label="Send Reset Code"
                onPress={handleSendCode}
                loading={loading}
                style={[styles.btnFull, { marginTop: SPACING.md }]}
              />

              <TouchableOpacity
                style={styles.manualResetLink}
                onPress={() => router.push('/reset-password')}
              >
                <Text style={styles.manualResetText}>Already have a reset code? Reset here</Text>
              </TouchableOpacity>
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

  form: { gap: SPACING.sm },
  input: { backgroundColor: '#FFFFFF', marginBottom: 2 },
  btnFull: { width: '100%' },

  manualResetLink: { alignItems: 'center', marginTop: SPACING.lg },
  manualResetText: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: '600' },
});
