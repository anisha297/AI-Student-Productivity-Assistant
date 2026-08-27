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
import SectionHeader from '../../components/SectionHeader';
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';

// ── Mock Data ─────────────────────────────────────────────────
const today = new Date();
const DATE_STR = today.toLocaleDateString('en-IN', {
  weekday: 'long',
  month:   'long',
  day:     'numeric',
});

const TASKS = [
  { id: '1', title: 'Data Structures Assignment',  due: 'Today, 11:59 PM',   priority: 'high',   done: false },
  { id: '2', title: 'Calculus Quiz Revision',      due: 'Tomorrow, 9:00 AM', priority: 'medium', done: false },
  { id: '3', title: 'Physics Lab Report',          due: 'Yesterday',         priority: 'high',   done: true  },
];

const EMAILS = [
  { id: '1', from: 'Prof. Johnson',          subject: 'Final Project Guidelines — Updated', time: '9:30 AM', tag: 'important' },
  { id: '2', from: 'no-reply@suspicious.net', subject: 'You have won a prize! Claim now',  time: '8:15 AM', tag: 'phishing'  },
];

const SHORTCUTS = [
  { icon: 'robot-outline',          label: 'AI Briefing', route: '/ai-briefing', color: '#059669' },
  { icon: 'school-outline',          label: 'Classroom',  route: '/classroom',   color: '#7C3AED' },
  { icon: 'shield-check-outline',    label: 'Security',   route: '/analytics',   color: '#DC2626' },
  { icon: 'chart-line',              label: 'Analytics',  route: '/analytics',   color: '#D97706' },
];

const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#059669' };

// ── Sub-components ────────────────────────────────────────────
function PriorityChip({ priority }) {
  const color = PRIORITY_COLORS[priority] || COLORS.muted;
  return (
    <View style={[chip.wrap, { backgroundColor: color + '20' }]}>
      <Text style={[chip.label, { color }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap:  { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: FONT.xs, fontWeight: '700' },
});

function EmailTag({ tag }) {
  if (tag === 'phishing') {
    return (
      <View style={[etag.wrap, { backgroundColor: '#FEE2E2' }]}>
        <MaterialCommunityIcons name="alert-circle" size={10} color="#DC2626" />
        <Text style={[etag.label, { color: '#DC2626' }]}> PHISHING</Text>
      </View>
    );
  }
  return (
    <View style={[etag.wrap, { backgroundColor: '#EEF2FF' }]}>
      <MaterialCommunityIcons name="star" size={10} color="#4F46E5" />
      <Text style={[etag.label, { color: '#4F46E5' }]}> IMPORTANT</Text>
    </View>
  );
}
const etag = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  label: { fontSize: FONT.xs, fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header ────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.userName}>Alex Student</Text>
            <Text style={styles.dateStr}>{DATE_STR}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitials}>AS</Text>
          </TouchableOpacity>
        </View>

        {/* ── AI Briefing Card ──────────────────────────── */}
        <TouchableOpacity
          style={styles.briefingCard}
          onPress={() => router.push('/ai-briefing')}
          activeOpacity={0.9}
        >
          <View style={styles.briefingTop}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="robot-outline" size={15} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI DAILY BRIEFING</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A5B4FC" />
          </View>
          <Text style={styles.briefingTitle}>You have a busy day ahead!</Text>
          <Text style={styles.briefingBody}>
            📚 1 assignment due tonight · 📧 2 important emails · 🗓 Study group at 3 PM
          </Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Productivity Score</Text>
            <Text style={styles.scoreValue}>85 / 100</Text>
          </View>
        </TouchableOpacity>

        {/* ── Quick Shortcuts ───────────────────────────── */}
        <View style={styles.shortcuts}>
          {SHORTCUTS.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.shortcut}
              onPress={() => router.push(s.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: s.color + '20' }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.shortcutLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tasks Section ─────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="📋 Pending Tasks" onPress={() => router.push('/(tabs)/tasks')} />
          {TASKS.map((task) => (
            <View key={task.id} style={[styles.taskCard, task.done && styles.taskDone]}>
              <MaterialCommunityIcons
                name={task.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={22}
                color={task.done ? '#059669' : PRIORITY_COLORS[task.priority]}
                style={{ marginRight: SPACING.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, task.done && styles.taskStrike]}>
                  {task.title}
                </Text>
                <Text style={styles.taskDue}>{task.due}</Text>
              </View>
              {!task.done && <PriorityChip priority={task.priority} />}
            </View>
          ))}
        </View>

        {/* ── Email Section ─────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="📧 Important Emails" onPress={() => router.push('/(tabs)/gmail')} />
          {EMAILS.map((mail) => (
            <TouchableOpacity
              key={mail.id}
              style={styles.emailCard}
              onPress={() => router.push('/email-details')}
              activeOpacity={0.8}
            >
              <View style={[styles.emailAvatar, { backgroundColor: mail.tag === 'phishing' ? '#FEE2E2' : '#EEF2FF' }]}>
                <Text style={[styles.emailAvatarText, { color: mail.tag === 'phishing' ? '#DC2626' : COLORS.primary }]}>
                  {mail.from[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emailFrom}>{mail.from}</Text>
                <Text style={styles.emailSubject} numberOfLines={1}>{mail.subject}</Text>
                <EmailTag tag={mail.tag} />
              </View>
              <Text style={styles.emailTime}>{mail.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Schedule Section ──────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="🗓 Today's Schedule" onPress={() => router.push('/(tabs)/calendar')} />
          <View style={styles.eventCard}>
            <View style={[styles.eventDot, { backgroundColor: '#7C3AED' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>CS Study Group</Text>
              <Text style={styles.eventTime}>3:00 PM – 5:00 PM · Library Room 2A</Text>
            </View>
          </View>
          <View style={styles.eventCard}>
            <View style={[styles.eventDot, { backgroundColor: '#DC2626' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>Data Structures Assignment Due</Text>
              <Text style={styles.eventTime}>11:59 PM · Online Submission</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flex: 1 },
  greeting:   { fontSize: FONT.md, color: '#64748B', fontWeight: '500' },
  userName:   { fontSize: FONT.xxl, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  dateStr:    { fontSize: FONT.sm, color: '#94A3B8', marginTop: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#FFFFFF', fontWeight: '800', fontSize: FONT.md },

  // AI Briefing Card
  briefingCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  briefingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiBadgeText:   { color: '#FFFFFF', fontSize: FONT.xs, fontWeight: '700', marginLeft: 4, letterSpacing: 0.5 },
  briefingTitle: { fontSize: FONT.xl, fontWeight: '800', color: '#FFFFFF', marginBottom: SPACING.sm },
  briefingBody:  { fontSize: FONT.sm, color: '#A5B4FC', lineHeight: 20, marginBottom: SPACING.md },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#312E81',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  scoreLabel: { color: '#C7D2FE', fontSize: FONT.sm, fontWeight: '500' },
  scoreValue: { color: '#FFFFFF', fontSize: FONT.sm, fontWeight: '700' },

  // Shortcuts
  shortcuts: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutLabel: { fontSize: FONT.xs, color: '#0F172A', fontWeight: '600', textAlign: 'center' },

  // Section
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },

  // Task cards
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  taskDone:   { opacity: 0.55 },
  taskTitle:  { fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },
  taskStrike: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskDue:    { fontSize: FONT.sm, color: '#94A3B8', marginTop: 2 },

  // Email cards
  emailCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  emailAvatar:     { width: 42, height: 42, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  emailAvatarText: { fontWeight: '800', fontSize: FONT.md },
  emailFrom:       { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  emailSubject:    { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },
  emailTime:       { fontSize: FONT.xs, color: '#94A3B8' },

  // Event cards
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  eventDot:   { width: 12, height: 12, borderRadius: RADIUS.full },
  eventTitle: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  eventTime:  { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },
});
