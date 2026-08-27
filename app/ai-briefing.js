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

const TODAY_STR = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  month:   'long',
  day:     'numeric',
});

const OVERVIEW_ITEMS = [
  { icon: 'email-outline',               label: 'Emails to review',  value: '3 unread',    color: '#4F46E5' },
  { icon: 'clock-alert-outline',         label: 'Deadlines today',   value: '1 assignment', color: '#DC2626' },
  { icon: 'calendar-clock',              label: 'Events today',      value: '1 study group',color: '#7C3AED' },
  { icon: 'checkbox-marked-circle-outline', label: 'Pending tasks',  value: '4 tasks',     color: '#0891B2' },
];

export default function AIBriefingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heading}>AI Daily Briefing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.aiIcon}>
            <MaterialCommunityIcons name="robot-outline" size={50} color="#A5B4FC" />
          </View>
          <Text style={styles.heroGreeting}>Good Morning, Alex! 👋</Text>
          <Text style={styles.heroDate}>{TODAY_STR}</Text>
          <Text style={styles.heroMessage}>
            Here's your AI-powered summary for today. Stay focused and productive!
          </Text>
        </View>

        {/* Content card */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>TODAY'S OVERVIEW</Text>

          {OVERVIEW_ITEMS.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
          ))}

          {/* Phase 2 notice */}
          <View style={styles.phaseCard}>
            <MaterialCommunityIcons name="robot-excited-outline" size={36} color="#4F46E5" />
            <Text style={styles.phaseTitle}>🚀 Full AI Briefing — Coming in Phase 2</Text>
            <Text style={styles.phaseText}>
              Gemini AI integration for personalised morning briefings, email summaries,
              deadline prioritisation and smart study recommendations will be connected
              in the next development phase.
            </Text>
          </View>
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

  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  aiIcon: {
    width: 92,
    height: 92,
    borderRadius: RADIUS.full,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroGreeting: { fontSize: FONT.xxl, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  heroDate:     { color: '#A5B4FC', fontSize: FONT.md, marginTop: 4, marginBottom: SPACING.md },
  heroMessage:  { color: '#C7D2FE', fontSize: FONT.md, textAlign: 'center', lineHeight: 22 },

  content: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.md, letterSpacing: 1 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  itemIcon:  { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: FONT.sm, color: '#64748B' },
  itemValue: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A', marginTop: 2 },

  phaseCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  phaseTitle: { fontSize: FONT.lg, fontWeight: '800', color: '#4F46E5', marginTop: SPACING.sm, marginBottom: SPACING.sm, textAlign: 'center' },
  phaseText:  { color: '#64748B', fontSize: FONT.md, textAlign: 'center', lineHeight: 22 },
});
