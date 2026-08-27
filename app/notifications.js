import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';

const NOTIFICATIONS = [
  { id: '1', title: 'Assignment Due Tonight',       body: 'Data Structures Graph Traversal is due at 11:59 PM',    time: 'Just now',    type: 'deadline', read: false },
  { id: '2', title: 'Phishing Email Detected',      body: 'A suspicious email from fakebank.com was flagged',       time: '2 min ago',   type: 'security', read: false },
  { id: '3', title: 'Study Group Reminder',         body: 'CS Study Group starts in 30 minutes — Library Room 2A', time: '28 min ago',  type: 'event',    read: false },
  { id: '4', title: 'New Email from Prof. Johnson', body: 'Final Project Guidelines have been updated',             time: '1 hour ago',  type: 'email',    read: true  },
  { id: '5', title: 'Daily Briefing Ready',         body: 'Your AI briefing for today is ready to review',          time: '3 hours ago', type: 'ai',       read: true  },
  { id: '6', title: 'Task Completed',               body: 'Physics Lab Report was marked as done',                  time: 'Yesterday',   type: 'task',     read: true  },
];

const TYPE_META = {
  deadline: { icon: 'clock-alert-outline',          color: '#DC2626' },
  security: { icon: 'shield-alert-outline',          color: '#DC2626' },
  event:    { icon: 'calendar-outline',              color: '#7C3AED' },
  email:    { icon: 'email-outline',                 color: '#4F46E5' },
  ai:       { icon: 'robot-outline',                 color: '#059669' },
  task:     { icon: 'checkbox-marked-circle-outline',color: '#059669' },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(NOTIFICATIONS);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifUnread]}
              onPress={() =>
                setItems((prev) =>
                  prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                )
              }
              activeOpacity={0.8}
            >
              <View style={[styles.notifIcon, { backgroundColor: meta.color + '20' }]}>
                <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
              </View>
              <View style={styles.notifBody}>
                <Text style={[styles.notifTitle, !item.read && styles.boldText]}>
                  {item.title}
                </Text>
                <Text style={styles.notifBody2} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F1F5F9' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  badge:   { backgroundColor: '#DC2626', borderRadius: RADIUS.full, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: FONT.xs, fontWeight: '800' },
  markAll: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: '600' },

  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md },
  notifUnread: { backgroundColor: '#EEF2FF', borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIcon: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifBody:  { flex: 1 },
  notifTitle: { fontSize: FONT.md, color: '#0F172A' },
  boldText:   { fontWeight: '700' },
  notifBody2: { fontSize: FONT.sm, color: '#64748B', marginTop: 2, lineHeight: 18 },
  notifTime:  { fontSize: FONT.xs, color: '#94A3B8', marginTop: 4 },
  unreadDot:  { width: 8, height: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, marginTop: 4, flexShrink: 0 },
});
