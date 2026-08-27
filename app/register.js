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

export default function RegisterScreen() {
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState({});

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!fullName.trim())
      e.fullName = 'Full name is required';
    if (!email.trim())
      e.email = 'Email is required';
    if (!password.trim())
      e.password = 'Password is required';
    else if (password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Register handler (UI-only placeholder) ─────────────────
  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/dashboard');
    }, 800);
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: '' }));

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
                <Text style={styles.iconEmoji}>✨</Text>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join your AI Student Productivity Assistant
              </Text>
            </View>

            {/* ── Form ──────────────────────────────────────── */}
            <View style={styles.form}>
              {/* Full Name */}
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
                mode="outlined"
                autoCapitalize="words"
                outlineColor={errors.fullName ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.fullName ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="account-outline" />}
                style={styles.input}
                error={!!errors.fullName}
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}

              {/* Email */}
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                outlineColor={errors.email ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.email ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
                error={!!errors.email}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              {/* Password */}
              <TextInput
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError('password'); }}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                outlineColor={errors.password ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.password ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
                style={styles.input}
                error={!!errors.password}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              {/* Confirm Password */}
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                mode="outlined"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                outlineColor={errors.confirmPassword ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.confirmPassword ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowConfirm((v) => !v)}
                  />
                }
                style={styles.input}
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}

              <AppButton
                label="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={[styles.btnFull, { marginTop: SPACING.sm }]}
              />

              {/* OR divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerLabel}>or</Text>
                <View style={styles.divider} />
              </View>

              <AppButton
                label="Continue with Google"
                variant="google"
                onPress={() => router.replace('/(tabs)/dashboard')}
                style={styles.btnFull}
              />
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#F8F9FF' },
  safe:  { flex: 1 },
  flex:  { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg },

  back:     { marginBottom: SPACING.md },
  backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '600' },

  header:    { alignItems: 'center', marginBottom: SPACING.xl },
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
  title:    { fontSize: FONT.xxxl, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: FONT.md, color: '#64748B', textAlign: 'center' },

  form:      { gap: SPACING.xs },
  input:     { backgroundColor: '#FFFFFF', marginBottom: 2 },
  errorText: { color: COLORS.danger, fontSize: FONT.sm, marginBottom: 6, marginLeft: 4 },

  btnFull: { width: '100%' },

  dividerRow:   { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  divider:      { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { marginHorizontal: SPACING.sm, color: '#94A3B8', fontSize: FONT.sm },

  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, marginBottom: SPACING.lg },
  loginText: { color: '#64748B', fontSize: FONT.md },
  loginLink: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '700' },
});
