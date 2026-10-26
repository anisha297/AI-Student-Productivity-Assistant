import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SectionHeader from '../../components/SectionHeader';
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import NotificationService from '../../services/notificationService';

// ── Dashboard Preview Data ─────────────────────────────────────
const today = new Date();
const DATE_STR = today.toLocaleDateString('en-IN', {
  weekday: 'long',
  month:   'long',
  day:     'numeric',
});

const INITIAL_TASKS = [
  { id: '1', title: 'Data Structures Assignment',  due: 'Today, 11:59 PM',   priority: 'high',   done: false },
  { id: '2', title: 'Calculus Quiz Revision',      due: 'Tomorrow, 9:00 AM', priority: 'medium', done: false },
  { id: '3', title: 'Physics Lab Report',          due: 'Yesterday',         priority: 'high',   done: true  },
];

const EMAILS = [
  { id: '1', from: 'Prof. Johnson',          subject: 'Final Project Guidelines — Updated', time: '9:30 AM', tag: 'important' },
  { id: '2', from: 'Reward Notification',    subject: 'You have won a prize! Claim now',  time: '8:15 AM', tag: 'phishing'  },
];

const SHORTCUTS = [
  { icon: 'robot-outline',          label: 'AI Briefing', route: '/ai-briefing', color: '#059669' },
  { icon: 'cards-outline',          label: 'Flashcards',  route: '/notes-flashcards', color: '#4F46E5' },
  { icon: 'school-outline',         label: 'Classroom',   route: '/classroom',   color: '#7C3AED' },
  { icon: 'chart-line',             label: 'Analytics',   route: '/analytics',   color: '#D97706' },
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
  const { user } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const fullName = user?.full_name || user?.username || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';
  const profile = user?.profile || {};
  const productivityScore = profile?.productivity_score || 85;
  const avatarUrl = profile?.avatar_url || profile?.profile_photo_url;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const completedCount = tasks.filter((t) => t.done).length;
  const completionRate = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id) => {
    let completedItem = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, done: !t.done };
          if (updated.done) completedItem = updated;
          return updated;
        }
        return t;
      })
    );

    if (completedItem) {
      const userPhone = user?.profile?.phone_number || '+91 Mobile';
      NotificationService.notifyPhone({
        title: `✓ Completed: ${completedItem.title}`,
        body: `Checked off from your daily dashboard agenda!`,
        type: 'task',
        phoneNumber: userPhone,
        showAlert: false,
      });
    }
  };

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
            <Text style={styles.greeting}>Good Day, {firstName} 👋</Text>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.dateStr}>{DATE_STR}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="#0F172A" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Streak & Progress Banner ──────────────────── */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakLeft}>
              <View style={styles.streakIconWrap}>
                <MaterialCommunityIcons name="fire" size={20} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.streakTitle}>5 Day Study Streak 🔥</Text>
                <Text style={styles.streakSubtitle}>
                  {completedCount} of {tasks.length} tasks completed today
                </Text>
              </View>
            </View>
            <View style={styles.progressPercentBadge}>
              <Text style={styles.progressPercentText}>{completionRate}%</Text>
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>
        </View>

        {/* ── Google Connection Indicator ──────────────── */}
        <TouchableOpacity
          style={[styles.connectionBanner, user?.google_connected ? styles.bannerConnected : styles.bannerOffline]}
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={user?.google_connected ? 'check-decagram' : 'google'}
            size={16}
            color={user?.google_connected ? '#059669' : '#4F46E5'}
          />
          <Text style={[styles.bannerText, { color: user?.google_connected ? '#065F46' : '#3730A3' }]}>
            {user?.google_connected
              ? 'Google Services Connected · Gmail, Classroom, Calendar'
              : 'Tap to connect Google Account in Settings'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={user?.google_connected ? '#059669' : '#4F46E5'}
          />
        </TouchableOpacity>

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
            <Text style={styles.scoreValue}>{productivityScore} / 100</Text>
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

        {/* ── Study Hub Quick Revision Banner ─────────────── */}
        <TouchableOpacity
          style={styles.studyHubBanner}
          onPress={() => router.push('/notes-flashcards')}
          activeOpacity={0.88}
        >
          <View style={styles.studyHubLeft}>
            <View style={styles.studyHubIconWrap}>
              <MaterialCommunityIcons name="cards-playing-outline" size={24} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.studyHubBadgeRow}>
                <Text style={styles.studyHubBadge}>ACTIVE RECALL</Text>
                <Text style={styles.studyHubCount}>Smart Study Hub</Text>
              </View>
              <Text style={styles.studyHubTitle}>Flashcards & Quick Notes</Text>
              <Text style={styles.studyHubSub}>Practice high-yield concepts or capture lecture notes</Text>
            </View>
          </View>
          <View style={styles.studyHubArrowBtn}>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* ── Tasks Section ─────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="📋 Today's Tasks (Tap to Check)" onPress={() => router.push('/(tabs)/tasks')} />
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, task.done && styles.taskDone]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.8}
            >
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
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Email Section ─────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="📧 Important Emails" onPress={() => router.push('/(tabs)/gmail')} />
          {EMAILS.map((mail) => (
            <TouchableOpacity
              key={mail.id}
              style={styles.emailCard}
              onPress={() =>
                router.push({
                  pathname: '/email-details',
                  params: { id: mail.id },
                })
              }
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
    paddingBottom: SPACING.sm,
  },
  headerLeft: { flex: 1 },
  greeting:   { fontSize: FONT.md, color: '#64748B', fontWeight: '500' },
  userName:   { fontSize: FONT.xxl, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#DC2626',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: { color: '#FFFFFF', fontWeight: '800', fontSize: FONT.md },
  avatarImage: { width: 48, height: 48, borderRadius: RADIUS.full },

  // Streak & Progress Card
  streakCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#9A3412',
  },
  streakSubtitle: {
    fontSize: FONT.xs,
    color: '#78716C',
    marginTop: 2,
  },
  progressPercentBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  progressPercentText: {
    fontSize: FONT.xs,
    fontWeight: '800',
    color: '#EA580C',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: RADIUS.full,
  },

  // Connection Banner
  connectionBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bannerConnected: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerOffline: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  bannerText: {
    flex: 1,
    fontSize: FONT.xs,
    fontWeight: '600',
  },

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

  // Study Hub Banner
  studyHubBanner: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  studyHubLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  studyHubIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyHubBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  studyHubBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  studyHubCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  studyHubTitle: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  studyHubSub: {
    fontSize: FONT.xs,
    color: '#64748B',
    marginTop: 1,
  },
  studyHubArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

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
