import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { label: 'Tasks Done',  value: '24' },
  { label: 'Emails',      value: '48' },
  { label: 'Study Hours', value: '32h' },
];

const MENU_ITEMS = [
  { icon: 'account-edit-outline',  label: 'Edit Profile',      route: '/edit-profile'  },
  { icon: 'lock-outline',          label: 'Change Password',   route: '/change-password' },
  { icon: 'bell-outline',          label: 'Notifications',     route: '/notifications' },
  { icon: 'shield-check-outline',  label: 'Email Security',    route: '/analytics'     },
  { icon: 'chart-line',            label: 'Analytics',         route: '/analytics'     },
  { icon: 'cog-outline',           label: 'Settings',          route: '/settings'      },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const profile = user?.profile || {};
  const fullName = user?.full_name || user?.username || 'Student User';
  const email = user?.email || 'student@university.edu';
  const college = profile?.college_name || 'University Student';
  const course = profile?.course || 'Computer Science';
  const year = profile?.year || 'Academic Year';
  const branch = profile?.branch || '';
  const studentId = profile?.student_id || `STU${user?.id || '001'}`;
  const productivityScore = profile?.productivity_score || 85;
  const avatarUrl = profile?.avatar_url || profile?.profile_photo_url;

  // Initials for avatar
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const handleLogoutPress = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heading}>Student Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => router.push('/edit-profile')}
            >
              <MaterialCommunityIcons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>
              {course} {branch ? `(${branch})` : ''} · {year}
            </Text>
          </View>

          {college ? (
            <View style={styles.collegeBadge}>
              <MaterialCommunityIcons name="school" size={14} color="#A5B4FC" />
              <Text style={styles.collegeText}>{college}</Text>
            </View>
          ) : null}

          {/* Stats row */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>ACADEMIC &amp; PROFILE DETAILS</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Student ID</Text>
            <Text style={styles.infoValue}>{studentId}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Productivity Score</Text>
            <Text style={[styles.infoValue, { color: COLORS.primary }]}>
              {productivityScore} / 100 🏆
            </Text>
          </View>

          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone &amp; SMS Alerts</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: profile?.phone_number ? '#0F172A' : '#64748B' },
                ]}
              >
                {profile?.phone_number ? profile.phone_number : 'Tap to add +91 phone'}
              </Text>
              {profile?.phone_number ? (
                <View style={styles.smsActiveBadge}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#059669" />
                  <Text style={styles.smsActiveText}>SMS Notifications Active</Text>
                </View>
              ) : null}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Auth Provider</Text>
            <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
              {profile?.provider === 'google' ? 'Google OAuth 2.0' : 'Django JWT Auth'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Google Services</Text>
              <Text style={[styles.infoValue, { color: user?.google_connected ? '#059669' : '#64748B' }]}>
                {user?.google_connected
                  ? '✓ Gmail, Classroom, Calendar Active'
                  : 'Not connected · Tap to setup'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
            ACCOUNT ACTIONS
          </Text>

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => item.route && router.push(item.route)}
              activeOpacity={0.8}
            >
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#DC2626" />
            <Text style={styles.logoutText}> Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1E1B4B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#FFFFFF' },

  hero: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#312E81',
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    borderColor: '#312E81',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: FONT.xxl },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },
  name: { fontSize: FONT.xxl, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  email: { fontSize: FONT.sm, color: '#A5B4FC', marginTop: 4, textAlign: 'center' },
  courseBadge: {
    backgroundColor: '#312E81',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.sm,
  },
  courseBadgeText: { color: '#C7D2FE', fontSize: FONT.sm, fontWeight: '600', textAlign: 'center' },
  collegeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  collegeText: { color: '#94A3B8', fontSize: FONT.xs, fontWeight: '500' },

  statsRow: { flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: FONT.xl, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: FONT.sm, color: '#A5B4FC', marginTop: 2 },

  content: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoLabel: { fontSize: FONT.sm, color: '#64748B' },
  infoValue: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  smsActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  smsActiveText: {
    fontSize: FONT.xs,
    color: '#059669',
    fontWeight: '600',
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: FONT.md },
});
