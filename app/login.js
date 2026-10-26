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
import useGoogleAuth from '../services/googleAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const { login } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      e.email = 'Please enter a valid email address';
    }

    if (!password) {
      e.password = 'Password is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Real Login handler ──────────────────────────────────────
  const handleLogin = async () => {
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else {
      setGeneralError(result.error || 'Login failed. Please check your credentials.');
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
                <Text style={styles.iconEmoji}>🎓</Text>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your AI Student Assistant
              </Text>
            </View>

            {/* General Error Banner */}
            {generalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            ) : null}

            {/* ── Form ──────────────────────────────────────── */}
            <View style={styles.form}>
              {/* Email */}
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((prev) => ({ ...prev, email: '' }));
                  setGeneralError('');
                }}
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
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((prev) => ({ ...prev, password: '' }));
                  setGeneralError('');
                }}
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

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotWrap}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AppButton
                label="Login"
                onPress={handleLogin}
                loading={loading}
                style={styles.btnFull}
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
                onPress={signInWithGoogle}
                style={styles.btnFull}
              />
            </View>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/register')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
  subtitle: { fontSize: FONT.md, color: '#64748B', textAlign: 'center' },

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
  errorText: { color: COLORS.danger, fontSize: FONT.sm, marginBottom: 6, marginLeft: 4 },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: SPACING.md, marginTop: 4 },
  forgotText: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: '600' },

  btnFull: { width: '100%' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { marginHorizontal: SPACING.sm, color: '#94A3B8', fontSize: FONT.sm },

  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, paddingBottom: SPACING.lg },
  signupText: { color: '#64748B', fontSize: FONT.md },
  signupLink: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '700' },
});
