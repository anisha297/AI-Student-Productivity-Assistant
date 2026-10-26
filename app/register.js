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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const { register } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!fullName.trim()) {
      e.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      e.email = 'Please enter a valid email address';
    }
    if (!collegeName.trim()) {
      e.collegeName = 'College name is required';
    }
    if (!course.trim()) {
      e.course = 'Course is required (e.g. BSc Computer Science)';
    }
    if (!year.trim()) {
      e.year = 'Year is required (e.g. 3rd Year)';
    }
    if (!branch.trim()) {
      e.branch = 'Branch/Major is required';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Real Register handler ──────────────────────────────────
  const handleRegister = async () => {
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirm_password: confirmPassword,
      college_name: collegeName.trim(),
      course: course.trim(),
      year: year.trim(),
      branch: branch.trim(),
      phone_number: phoneNumber.trim(),
    });
    setLoading(false);
    console.log('Register result:', result);

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else {
      if (result.errors && Object.keys(result.errors).length > 0) {
        // Map backend field names to UI state keys
        const fieldMap = {
          full_name: 'fullName',
          email: 'email',
          college_name: 'collegeName',
          course: 'course',
          year: 'year',
          branch: 'branch',
          phone_number: 'phoneNumber',
          password: 'password',
          confirm_password: 'confirmPassword',
        };
        const fieldUpdates = {};
        const unmappedMessages = [];

        Object.entries(result.errors).forEach(([key, msgs]) => {
          const uiKey = fieldMap[key];
          const message = Array.isArray(msgs) ? msgs[0] : msgs;
          if (uiKey) {
            fieldUpdates[uiKey] = message;
          } else {
            // non_field_errors or unknown keys go to the banner
            unmappedMessages.push(message);
          }
        });

        setErrors((prev) => ({ ...prev, ...fieldUpdates }));

        // Only show banner for non-field errors (e.g. "Passwords do not match")
        if (unmappedMessages.length > 0) {
          setGeneralError(unmappedMessages.join(' '));
        }
        // If there are field errors but no non-field errors, don't show generic banner
      } else {
        setGeneralError(result.error || 'Registration failed. Please try again.');
      }
    }
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setGeneralError('');
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
                <Text style={styles.iconEmoji}>✨</Text>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join your AI Student Productivity Assistant
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
              <Text style={styles.sectionHeader}>PERSONAL DETAILS</Text>

              {/* Full Name */}
              <TextInput
                label="Full Name *"
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
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

              {/* Email */}
              <TextInput
                label="Email Address *"
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
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              {/* Phone (Optional) */}
              <TextInput
                label="Phone Number (Optional)"
                value={phoneNumber}
                onChangeText={(t) => { setPhoneNumber(t); clearError('phoneNumber'); }}
                mode="outlined"
                keyboardType="phone-pad"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="phone-outline" />}
                style={styles.input}
              />

              <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>ACADEMIC INFORMATION</Text>

              {/* College Name */}
              <TextInput
                label="College / University Name *"
                value={collegeName}
                onChangeText={(t) => { setCollegeName(t); clearError('collegeName'); }}
                mode="outlined"
                outlineColor={errors.collegeName ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.collegeName ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="school-outline" />}
                style={styles.input}
                error={!!errors.collegeName}
              />
              {errors.collegeName ? <Text style={styles.errorText}>{errors.collegeName}</Text> : null}

              {/* Course & Branch row */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <TextInput
                    label="Course *"
                    value={course}
                    onChangeText={(t) => { setCourse(t); clearError('course'); }}
                    mode="outlined"
                    placeholder="BSc CS"
                    outlineColor={errors.course ? COLORS.danger : COLORS.border}
                    activeOutlineColor={errors.course ? COLORS.danger : COLORS.primary}
                    style={styles.input}
                    error={!!errors.course}
                  />
                  {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}
                </View>
                <View style={styles.half}>
                  <TextInput
                    label="Branch *"
                    value={branch}
                    onChangeText={(t) => { setBranch(t); clearError('branch'); }}
                    mode="outlined"
                    placeholder="AI / CS"
                    outlineColor={errors.branch ? COLORS.danger : COLORS.border}
                    activeOutlineColor={errors.branch ? COLORS.danger : COLORS.primary}
                    style={styles.input}
                    error={!!errors.branch}
                  />
                  {errors.branch ? <Text style={styles.errorText}>{errors.branch}</Text> : null}
                </View>
              </View>

              {/* Year */}
              <TextInput
                label="Current Year * (e.g. 3rd Year / Final Year)"
                value={year}
                onChangeText={(t) => { setYear(t); clearError('year'); }}
                mode="outlined"
                outlineColor={errors.year ? COLORS.danger : COLORS.border}
                activeOutlineColor={errors.year ? COLORS.danger : COLORS.primary}
                left={<TextInput.Icon icon="calendar-clock" />}
                style={styles.input}
                error={!!errors.year}
              />
              {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}

              <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>SECURITY</Text>

              {/* Password */}
              <TextInput
                label="Password *"
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
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {/* Confirm Password */}
              <TextInput
                label="Confirm Password *"
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
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

              <AppButton
                label="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={[styles.btnFull, { marginTop: SPACING.md }]}
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
  root: { flex: 1, backgroundColor: '#F8F9FF' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg },

  back: { marginBottom: SPACING.md },
  backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '600' },

  header: { alignItems: 'center', marginBottom: SPACING.lg },
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
  sectionHeader: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
  input: { backgroundColor: '#FFFFFF', marginBottom: 2 },
  errorText: { color: COLORS.danger, fontSize: FONT.sm, marginBottom: 6, marginLeft: 4 },

  btnFull: { width: '100%' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { marginHorizontal: SPACING.sm, color: '#94A3B8', fontSize: FONT.sm },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, marginBottom: SPACING.lg },
  loginText: { color: '#64748B', fontSize: FONT.md },
  loginLink: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '700' },
});
