import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const TODAY_STR = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  month:   'long',
  day:     'numeric',
});

const OVERVIEW_ITEMS = [
  { icon: 'email-outline',                  label: 'Emails to review',     value: '3 unread',     color: '#4F46E5', route: '/(tabs)/gmail' },
  { icon: 'clock-alert-outline',            label: 'Deadlines today',      value: '1 assignment', color: '#DC2626', route: '/(tabs)/tasks' },
  { icon: 'cards-outline',                  label: 'Flashcards to review', value: '7 cards ready', color: '#6366F1', route: '/notes-flashcards' },
  { icon: 'calendar-clock',                 label: 'Events today',         value: '1 study group',color: '#7C3AED', route: '/(tabs)/calendar' },
  { icon: 'checkbox-marked-circle-outline', label: 'Pending tasks',        value: '4 tasks',      color: '#0891B2', route: '/(tabs)/tasks' },
];

const STUDY_TIPS = [
  {
    title: 'Active Recall & Flashcards',
    text: 'Test yourself with flashcards before flipping to the answer. Testing your memory builds 50% stronger recall than passively reading notes.',
  },
  {
    title: 'Pomodoro Technique',
    text: 'Work with full focus for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 20-minute rest.',
  },
  {
    title: 'Feynman Learning Method',
    text: 'Try explaining the core concept in simple terms to someone else. If you get stuck, review your notes to fill the knowledge gap.',
  },
  {
    title: 'Spaced Repetition',
    text: 'Revisit difficult topics at 1-day, 3-day, and 7-day intervals to lock information into long-term memory.',
  },
  {
    title: 'The 2-Minute Rule',
    text: 'If a small academic task (like replying to an email or submitting a form) takes less than two minutes, do it immediately.',
  },
];

export default function AIBriefingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : (user?.username || 'Student');

  // Tip carousel / shuffle state
  const [tipIndex, setTipIndex] = useState(0);

  // Focus Timer Modal State
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsLeft]);

  const toggleTimer = () => setTimerRunning((prev) => !prev);
  const resetTimer = (mins = 25) => {
    setTimerRunning(false);
    setSecondsLeft(mins * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
  };

  const currentTip = STUDY_TIPS[tipIndex];

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
        <Text style={styles.heading}>AI Daily Briefing</Text>
        <TouchableOpacity onPress={() => setTimerModalVisible(true)}>
          <MaterialCommunityIcons name="timer-outline" size={24} color="#A5B4FC" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.aiIcon}>
            <MaterialCommunityIcons name="robot-outline" size={48} color="#A5B4FC" />
          </View>
          <Text style={styles.heroGreeting}>Good Morning, {firstName}! 👋</Text>
          <Text style={styles.heroDate}>{TODAY_STR}</Text>
          <Text style={styles.heroMessage}>
            Here's your AI-powered summary for today. Stay focused and productive!
          </Text>

          {/* Quick Focus Sprint Launch Button */}
          <TouchableOpacity
            style={styles.heroFocusBtn}
            onPress={() => setTimerModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="timer-sand" size={18} color="#FFFFFF" />
            <Text style={styles.heroFocusText}>Start 25-Min Study Sprint</Text>
          </TouchableOpacity>
        </View>

        {/* Content card */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>TODAY'S OVERVIEW (TAP TO VIEW)</Text>

          {OVERVIEW_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.itemRow}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}

          {/* Daily Insight Card with Shuffle feature */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleRow}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={COLORS.primary} />
                <Text style={styles.insightTitle}>{currentTip.title}</Text>
              </View>
              <TouchableOpacity
                onPress={nextTip}
                style={styles.shuffleBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="cached" size={18} color={COLORS.primary} />
                <Text style={styles.shuffleText}>Next Tip</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.insightText}>{currentTip.text}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Focus Timer Modal */}
      <Modal
        visible={timerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.timerModalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.timerModalTitle}>🎯 Study Sprint Timer</Text>
              <TouchableOpacity onPress={() => setTimerModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.timerClockBox}>
              <Text style={styles.timerDigits}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timerStatusText}>
                {timerRunning ? 'Deep Focus Session in Progress' : 'Paused / Ready'}
              </Text>
            </View>

            {/* Preset Selector */}
            <View style={styles.presetRow}>
              {[15, 25, 45].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.presetChip,
                    secondsLeft === mins * 60 && styles.presetChipActive,
                  ]}
                  onPress={() => resetTimer(mins)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      secondsLeft === mins * 60 && styles.presetChipTextActive,
                    ]}
                  >
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Controls */}
            <View style={styles.timerControlsRow}>
              <TouchableOpacity
                style={[styles.timerControlBtn, styles.timerToggleBtn]}
                onPress={toggleTimer}
              >
                <MaterialCommunityIcons
                  name={timerRunning ? 'pause' : 'play'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.timerControlBtnText}>
                  {timerRunning ? 'Pause' : 'Start Focus'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerControlBtn, styles.timerResetBtn]}
                onPress={() => resetTimer(25)}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#64748B" />
                <Text style={[styles.timerControlBtnText, { color: '#64748B' }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  aiIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroGreeting: { fontSize: FONT.xl, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  heroDate:     { color: '#A5B4FC', fontSize: FONT.sm, marginTop: 4, marginBottom: SPACING.sm },
  heroMessage:  { color: '#C7D2FE', fontSize: FONT.sm, textAlign: 'center', lineHeight: 20 },

  heroFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    gap: 8,
  },
  heroFocusText: { color: '#FFFFFF', fontSize: FONT.sm, fontWeight: '700' },

  content: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.md, letterSpacing: 0.8 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcon:  { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: FONT.sm, color: '#64748B' },
  itemValue: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A', marginTop: 2 },

  insightCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightTitle: {
    fontSize: FONT.sm,
    fontWeight: '800',
    color: '#312E81',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shuffleText: {
    fontSize: FONT.xs,
    color: COLORS.primary,
    fontWeight: '700',
  },
  insightText: {
    color: '#475569',
    fontSize: FONT.sm,
    lineHeight: 20,
    marginTop: 4,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  timerModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timerModalTitle: {
    fontSize: FONT.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  timerClockBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  timerDigits: {
    fontSize: 54,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  timerStatusText: {
    fontSize: FONT.xs,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: SPACING.md,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#64748B',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginTop: SPACING.sm,
  },
  timerControlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  timerToggleBtn: {
    backgroundColor: COLORS.primary,
  },
  timerResetBtn: {
    backgroundColor: '#F1F5F9',
  },
  timerControlBtnText: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
