import React, { useState } from 'react';
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
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';

// ── Helpers ───────────────────────────────────────────────────
const today      = new Date();
const MONTH_NAME = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDays() {
  const days = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    days.push({
      date:    d.getDate(),
      dayName: DAY_NAMES[d.getDay()],
      isToday: offset === 0,
    });
  }
  return days;
}

// ── Mock Events ───────────────────────────────────────────────
const EVENTS = [
  {
    id: '1',
    title:    'CS Study Group',
    time:     '3:00 PM',
    duration: '2 hours',
    location: 'Library Room 2A',
    type:     'study',
    color:    '#7C3AED',
  },
  {
    id: '2',
    title:    'Data Structures Assignment',
    time:     '11:59 PM',
    duration: 'Deadline',
    location: 'Online Submission',
    type:     'deadline',
    color:    '#DC2626',
  },
  {
    id: '3',
    title:    'Calculus Quiz',
    time:     'Tomorrow, 10:00 AM',
    duration: '1 hour',
    location: 'Room 301',
    type:     'exam',
    color:    '#D97706',
  },
  {
    id: '4',
    title:    'Office Hours — Prof. Johnson',
    time:     'Tomorrow, 2:00 PM',
    duration: '30 minutes',
    location: 'Staff Room B',
    type:     'meeting',
    color:    '#059669',
  },
  {
    id: '5',
    title:    'FYP Progress Meeting',
    time:     'Friday, 11:00 AM',
    duration: '1 hour',
    location: 'Online (Google Meet)',
    type:     'meeting',
    color:    '#0891B2',
  },
];

const TYPE_ICONS = {
  study:    'book-open-outline',
  deadline: 'clock-alert-outline',
  exam:     'pencil-outline',
  meeting:  'video-outline',
};

// ── Main Screen ───────────────────────────────────────────────
export default function CalendarScreen() {
  const insets   = useSafeAreaInsets();
  const weekDays = getWeekDays();
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.heading}>Calendar</Text>
        <Text style={styles.monthLabel}>{MONTH_NAME}</Text>
      </View>

      {/* Week Strip */}
      <View style={styles.weekStrip}>
        {weekDays.map((d) => (
          <TouchableOpacity
            key={d.date}
            style={[styles.dayBtn, selectedDate === d.date && styles.dayBtnActive]}
            onPress={() => setSelectedDate(d.date)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dayName, selectedDate === d.date && styles.dayTextActive]}>
              {d.dayName}
            </Text>
            <Text style={[styles.dayNum, selectedDate === d.date && styles.dayTextActive]}>
              {d.date}
            </Text>
            {d.isToday && (
              <View
                style={[
                  styles.todayDot,
                  selectedDate === d.date && { backgroundColor: '#FFFFFF' },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Events */}
      <ScrollView
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TODAY'S EVENTS &amp; UPCOMING</Text>

        {EVENTS.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: event.color + '20' }]}>
              <MaterialCommunityIcons
                name={TYPE_ICONS[event.type]}
                size={22}
                color={event.color}
              />
            </View>
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.eventMeta}>
                <MaterialCommunityIcons name="clock-outline" size={13} color="#94A3B8" />
                <Text style={styles.eventMetaText}>
                  {' '}{event.time} · {event.duration}
                </Text>
              </View>
              <View style={styles.eventMeta}>
                <MaterialCommunityIcons name="map-marker-outline" size={13} color="#94A3B8" />
                <Text style={styles.eventMetaText}> {event.location}</Text>
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: event.color + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: event.color }]}>
                {event.type.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  heading:    { fontSize: FONT.xl, fontWeight: '800', color: '#0F172A' },
  monthLabel: { fontSize: FONT.sm, color: '#64748B' },

  weekStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  dayBtnActive: { backgroundColor: COLORS.primary },
  dayName:      { fontSize: FONT.xs, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  dayNum:       { fontSize: FONT.md, color: '#0F172A', fontWeight: '700' },
  dayTextActive: { color: '#FFFFFF' },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },

  sectionLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBody:     { flex: 1 },
  eventTitle:    { fontSize: FONT.md, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  eventMeta:     { flexDirection: 'row', alignItems: 'center' },
  eventMetaText: { fontSize: FONT.sm, color: '#64748B' },
  typeBadge:     { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
  typeBadgeText: { fontSize: FONT.xs, fontWeight: '700' },
});
