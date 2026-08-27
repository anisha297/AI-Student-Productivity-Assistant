import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';

const PROFILE = {
  name:    'Alex Student',
  email:   'alex.student@university.edu',
  course:  'BSc Computer Science',
  year:    'Final Year (Year 4)',
  id:      'CS20210042',
  score:   85,
};

const STATS = [
  { label: 'Tasks Done',  value: '24' },
  { label: 'Emails',      value: '48' },
  { label: 'Study Hours', value: '32h' },
];

const MENU_ITEMS = [
  { icon: 'bell-outline',          label: 'Notifications',     route: '/notifications' },
  { icon: 'shield-check-outline',  label: 'Email Security',    route: '/analytics'     },
  { icon: 'chart-line',            label: 'Analytics',         route: '/analytics'     },
  { icon: 'cog-outline',           label: 'Settings',          route: '/settings'      },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="cog-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.name}>{PROFILE.name}</Text>
          <Text style={styles.email}>{PROFILE.email}</Text>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{PROFILE.course} · {PROFILE.year}</Text>
          </View>
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
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Student ID</Text>
            <Text style={styles.infoValue}>{PROFILE.id}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Productivity Score</Text>
            <Text style={[styles.infoValue, { color: COLORS.primary }]}>{PROFILE.score} / 100 🏆</Text>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>QUICK LINKS</Text>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
            >
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/')}
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
  root:    { flex: 1, backgroundColor: '#1E1B4B' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#FFFFFF' },

  hero: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  avatar: { width: 88, height: 88, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 4, borderColor: '#312E81' },
  avatarText:   { color: '#FFFFFF', fontWeight: '900', fontSize: FONT.xxl },
  name:         { fontSize: FONT.xxl, fontWeight: '800', color: '#FFFFFF' },
  email:        { fontSize: FONT.sm, color: '#A5B4FC', marginTop: 4 },
  courseBadge:  { backgroundColor: '#312E81', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, marginTop: SPACING.sm },
  courseBadgeText: { color: '#C7D2FE', fontSize: FONT.sm, fontWeight: '600' },
  statsRow:  { flexDirection: 'row', marginTop: SPACING.xl, gap: SPACING.xl },
  stat:      { alignItems: 'center' },
  statValue: { fontSize: FONT.xl, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: FONT.sm, color: '#A5B4FC', marginTop: 2 },

  content:     { flex: 1, backgroundColor: '#F8F9FF', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 60 },
  sectionLabel:{ fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.sm, letterSpacing: 1 },
  infoCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  infoLabel:   { fontSize: FONT.sm, color: '#64748B' },
  infoValue:   { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },

  menuRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  menuIcon:   { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  menuLabel:  { flex: 1, fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },

  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: FONT.md },
});
