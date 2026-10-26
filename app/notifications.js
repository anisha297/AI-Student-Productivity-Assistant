import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import NotificationService from '../services/notificationService';

const TYPE_META = {
  deadline: { icon: 'clock-alert-outline',           color: '#DC2626' },
  security: { icon: 'shield-alert-outline',          color: '#DC2626' },
  event:    { icon: 'calendar-outline',              color: '#7C3AED' },
  email:    { icon: 'email-outline',                 color: '#4F46E5' },
  ai:       { icon: 'robot-outline',                 color: '#059669' },
  task:     { icon: 'checkbox-marked-circle-outline', color: '#0284C7' },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const notifs = await NotificationService.getNotifications();
      if (isMounted) {
        setItems(notifs);
        setLoading(false);
      }
    })();

    const unsubscribe = NotificationService.subscribe((updated) => {
      if (isMounted) {
        setItems(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const markAllRead = async () => {
    const updated = await NotificationService.markAllRead();
    setItems(updated);
  };

  const handlePress = async (item) => {
    if (!item.read) {
      const updated = await NotificationService.markAsRead(item.id);
      setItems(updated);
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Phone &amp; App Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={markAllRead}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>
                When you add new tasks or receive academic alerts, they will appear here and buzz your phone!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = TYPE_META[item.type] || TYPE_META.task;
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifUnread]}
                onPress={() => handlePress(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.notifIcon, { backgroundColor: meta.color + '20' }]}>
                  <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={styles.notifBody}>
                  <View style={styles.topRow}>
                    <Text style={[styles.notifTitle, !item.read && styles.boldText]}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody2} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <View style={styles.bottomMetaRow}>
                    <Text style={styles.notifTime}>{item.time}</Text>
                    <View style={styles.phoneDispatchedBadge}>
                      <MaterialCommunityIcons name="cellphone-check" size={11} color="#059669" />
                      <Text style={styles.phoneDispatchedText}>Dispatched to Phone</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: RADIUS.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: FONT.xs, fontWeight: '800' },
  markAll: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: '600' },

  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  notifUnread: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifBody: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notifTitle: { fontSize: FONT.md, color: '#0F172A', flex: 1 },
  boldText: { fontWeight: '700' },
  notifBody2: { fontSize: FONT.sm, color: '#64748B', marginTop: 2, lineHeight: 18 },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  notifTime: { fontSize: FONT.xs, color: '#94A3B8' },
  phoneDispatchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  phoneDispatchedText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginLeft: 6,
    flexShrink: 0,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: '#475569',
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: FONT.sm,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
});
