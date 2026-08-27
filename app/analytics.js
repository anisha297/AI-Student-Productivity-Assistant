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

const STATS = [
  { label: 'Tasks Completed',  value: '24',  icon: 'checkbox-marked-circle-outline', color: '#059669' },
  { label: 'Emails Processed', value: '48',  icon: 'email-check-outline',            color: '#4F46E5' },
  { label: 'Phishing Caught',  value: '6',   icon: 'shield-check-outline',           color: '#DC2626' },
  { label: 'Study Hours',      value: '32h', icon: 'clock-outline',                  color: '#D97706' },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.heading}>Productivity Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Your Productivity Score</Text>
          <Text style={styles.scoreValue}>85</Text>
          <Text style={styles.scoreMax}>/100</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '85%' }]} />
          </View>
          <Text style={styles.scoreRank}>🏆 Top 15% of students this week</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionLabel}>THIS MONTH'S STATS</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Phase notice */}
        <View style={styles.phaseCard}>
          <MaterialCommunityIcons name="chart-line" size={32} color={COLORS.warning} />
          <Text style={styles.phaseTitle}>📊 Full Analytics — Phase 2</Text>
          <Text style={styles.phaseText}>
            Real-time charts, weekly/monthly productivity trends, email activity heatmaps,
            and AI-powered study recommendations will be available in Phase 2.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F8F9FF' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  content: { padding: SPACING.lg, paddingBottom: 60 },

  scoreCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  scoreTitle:  { fontSize: FONT.md, color: '#A5B4FC', fontWeight: '600' },
  scoreValue:  { fontSize: 72, fontWeight: '900', color: '#FFFFFF', lineHeight: 80 },
  scoreMax:    { fontSize: FONT.lg, color: '#A5B4FC', marginBottom: SPACING.md },
  progressBar: { width: '100%', height: 8, backgroundColor: '#312E81', borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  progressFill: { height: '100%', backgroundColor: '#818CF8', borderRadius: RADIUS.full },
  scoreRank:   { fontSize: FONT.sm, color: '#C7D2FE', fontWeight: '600' },

  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.sm, letterSpacing: 1 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon:  { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: FONT.xxl, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: FONT.sm, color: '#64748B', textAlign: 'center', marginTop: 4 },

  phaseCard:  { backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  phaseTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLORS.warning, marginTop: SPACING.sm, marginBottom: SPACING.sm, textAlign: 'center' },
  phaseText:  { color: '#64748B', fontSize: FONT.md, textAlign: 'center', lineHeight: 22 },
});
