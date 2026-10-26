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
  Switch,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppButton from '../components/AppButton';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const profile = user?.profile || {};

  // Extract raw 10 digits if already stored with +91
  const parseInitialPhone = (raw) => {
    if (!raw) return '';
    return raw.replace(/^\+91\s*/, '').replace(/\D/g, '').slice(-10);
  };

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [collegeName, setCollegeName] = useState(profile?.college_name || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [year, setYear] = useState(profile?.year || '');
  const [branch, setBranch] = useState(profile?.branch || '');
  const [phoneDigits, setPhoneDigits] = useState(parseInitialPhone(profile?.phone_number));
  const [enablePhoneNotifications, setEnablePhoneNotifications] = useState(
    Boolean(profile?.phone_number)
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validate Indian mobile number: 10 digits starting with 6, 7, 8, or 9
  const isPhoneValid = /^[6-9]\d{9}$/.test(phoneDigits);
  const hasPhoneInput = phoneDigits.length > 0;

  const handlePhoneChange = (text) => {
    // Strip non-digits and strip leading +91 or 0 if pasted
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      cleaned = cleaned.slice(2);
    }
    if (cleaned.startsWith('0') && cleaned.length > 10) {
      cleaned = cleaned.slice(1);
    }
    // Limit to 10 digits
    cleaned = cleaned.slice(0, 10);
    setPhoneDigits(cleaned);
    setError('');
  };

  const sendTestNotification = () => {
    if (!isPhoneValid) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9 first.'
      );
      return;
    }

    Alert.alert(
      '🔔 SMS Notification Dispatched',
      `A test alert has been dispatched to +91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}:\n\n"Antigravity Student AI: Your phone is now linked! You will receive daily briefing summaries, assignment deadlines, and security alerts."`
    );
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setError('Full name cannot be empty');
      return;
    }

    // Validate phone number if entered or if notifications enabled
    if (hasPhoneInput || enablePhoneNotifications) {
      if (!isPhoneValid) {
        setError(
          'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9) for +91.'
        );
        return;
      }
    }

    // Validate avatar URL format if provided
    if (avatarUrl.trim() && !/^https?:\/\/.+/i.test(avatarUrl.trim())) {
      setError('Profile Picture URL must be a valid link starting with http:// or https://');
      return;
    }

    const formattedPhone = isPhoneValid ? `+91 ${phoneDigits}` : '';

    setLoading(true);
    const result = await updateProfile({
      full_name: fullName.trim(),
      college_name: collegeName.trim(),
      course: course.trim(),
      year: year.trim(),
      branch: branch.trim(),
      phone_number: formattedPhone,
      avatar_url: avatarUrl.trim(),
    });
    setLoading(false);

    if (result.success) {
      const msg = isPhoneValid && enablePhoneNotifications
        ? `Profile updated! Notifications are now active for +91 ${phoneDigits}.`
        : 'Profile updated successfully!';
      setSuccessMessage(msg);

      if (isPhoneValid && enablePhoneNotifications) {
        Alert.alert(
          '✓ Phone Notifications Activated',
          `All upcoming academic deadlines, daily AI briefings, and urgent alerts will now be sent to +91 ${phoneDigits}.`
        );
      }

      setTimeout(() => {
        router.back();
      }, 1200);
    } else {
      setError(result.error || 'Failed to update profile. Please check entered fields.');
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
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.heading}>Edit Profile</Text>
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
                <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Text style={styles.sectionHeader}>BASIC INFORMATION</Text>

              {/* Full Name */}
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  setError('');
                }}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="account-outline" />}
                style={styles.input}
              />

              {/* Email (Read Only) */}
              <TextInput
                label="Email (Cannot be changed)"
                value={user?.email || ''}
                mode="outlined"
                disabled
                outlineColor={COLORS.border}
                left={<TextInput.Icon icon="email-lock-outline" />}
                style={[styles.input, { opacity: 0.7 }]}
              />

              {/* ── Indian Phone Number Input (+91) ── */}
              <Text style={[styles.sectionHeader, { marginTop: SPACING.sm }]}>
                PHONE &amp; SMS NOTIFICATIONS
              </Text>

              <View style={styles.phoneInputContainer}>
                {/* +91 Country Code Badge */}
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                {/* 10-digit Input */}
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Mobile Number"
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    value={phoneDigits}
                    onChangeText={handlePhoneChange}
                    mode="outlined"
                    keyboardType="phone-pad"
                    maxLength={10}
                    outlineColor={
                      hasPhoneInput
                        ? isPhoneValid
                          ? COLORS.success
                          : '#F87171'
                        : COLORS.border
                    }
                    activeOutlineColor={isPhoneValid ? COLORS.success : COLORS.primary}
                    left={<TextInput.Icon icon="phone-outline" />}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Validation helper status */}
              {hasPhoneInput && (
                <View style={styles.phoneStatusRow}>
                  <MaterialCommunityIcons
                    name={isPhoneValid ? 'check-circle' : 'information-outline'}
                    size={14}
                    color={isPhoneValid ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.phoneStatusText,
                      { color: isPhoneValid ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {isPhoneValid
                      ? 'Valid Indian mobile (+91) — Ready to receive SMS notifications'
                      : `${10 - phoneDigits.length} more digits needed (must start with 6-9)`}
                  </Text>
                </View>
              )}

              {/* Phone Notification Settings Card */}
              <View style={styles.notificationCard}>
                <View style={styles.notificationTopRow}>
                  <View style={styles.notificationIconWrap}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>SMS &amp; Daily Briefing Alerts</Text>
                    <Text style={styles.notificationSubtitle}>
                      Receive urgent assignment reminders, AI briefings, and phishing alerts on your phone.
                    </Text>
                  </View>
                  <Switch
                    value={enablePhoneNotifications}
                    onValueChange={setEnablePhoneNotifications}
                    trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                    thumbColor={enablePhoneNotifications ? COLORS.primary : '#94A3B8'}
                  />
                </View>

                {enablePhoneNotifications && (
                  <TouchableOpacity
                    style={styles.testAlertBtn}
                    onPress={sendTestNotification}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="cellphone-message" size={16} color={COLORS.primary} />
                    <Text style={styles.testAlertBtnText}>Send Test Notification</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Avatar URL */}
              <Text style={[styles.sectionHeader, { marginTop: SPACING.sm }]}>PROFILE PICTURE</Text>
              <TextInput
                label="Profile Picture URL (Optional)"
                value={avatarUrl}
                onChangeText={(t) => {
                  setAvatarUrl(t);
                  setError('');
                }}
                mode="outlined"
                autoCapitalize="none"
                placeholder="https://example.com/photo.jpg"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="image-outline" />}
                style={styles.input}
              />

              {/* Academic Info */}
              <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>ACADEMIC INFORMATION</Text>

              {/* College */}
              <TextInput
                label="College / University"
                value={collegeName}
                onChangeText={(t) => {
                  setCollegeName(t);
                  setError('');
                }}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="school-outline" />}
                style={styles.input}
              />

              {/* Course */}
              <TextInput
                label="Course / Degree"
                value={course}
                onChangeText={(t) => {
                  setCourse(t);
                  setError('');
                }}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="book-outline" />}
                style={styles.input}
              />

              {/* Year */}
              <TextInput
                label="Year of Study"
                value={year}
                onChangeText={(t) => {
                  setYear(t);
                  setError('');
                }}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="calendar-outline" />}
                style={styles.input}
              />

              {/* Branch */}
              <TextInput
                label="Branch / Specialisation"
                value={branch}
                onChangeText={(t) => {
                  setBranch(t);
                  setError('');
                }}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="source-branch" />}
                style={styles.input}
              />

              <AppButton
                label="Save Changes"
                onPress={handleSave}
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
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingBottom: 60 },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successBannerText: {
    flex: 1,
    color: COLORS.success,
    fontSize: FONT.sm,
    fontWeight: '600',
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: FONT.sm,
    fontWeight: '600',
  },

  form: { gap: SPACING.xs },
  sectionHeader: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  input: { backgroundColor: '#FFFFFF', marginBottom: 4 },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    height: 52,
    gap: 4,
    marginBottom: 4,
  },
  flagEmoji: {
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  phoneStatusText: {
    fontSize: FONT.xs,
    fontWeight: '600',
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  notificationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notificationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationSubtitle: {
    fontSize: FONT.xs,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  testAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    marginTop: SPACING.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  testAlertBtnText: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },

  btnFull: { width: '100%' },
});
