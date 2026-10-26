import React, { useState, useEffect } from 'react';
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
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';
import GoogleServices from '../../services/googleServices';

// ── Demo Emails ───────────────────────────────────────────────
const DEMO_EMAILS = [
  {
    id: '1',
    from: 'Prof. Johnson',
    subject: 'Final Project Guidelines — Updated',
    preview: 'Please review the updated rubric before your submission deadline...',
    time: '9:30 AM',
    tag: 'important',
    read: false,
  },
  {
    id: '2',
    from: 'no-reply@suspicious.net',
    subject: 'You have won a prize! Claim now!!!',
    preview: 'Click here immediately to claim your $500 reward. Limited time offer...',
    time: '8:15 AM',
    tag: 'phishing',
    read: true,
  },
  {
    id: '3',
    from: 'Career Services',
    subject: 'Upcoming Resume Review Session',
    preview: 'We are hosting a free resume review session next Thursday at 2 PM...',
    time: 'Yesterday',
    tag: 'important',
    read: true,
  },
  {
    id: '4',
    from: 'Library System',
    subject: 'Book Loan Reminder',
    preview: 'Your borrowed book "Introduction to Algorithms" is due in 3 days...',
    time: 'Yesterday',
    tag: null,
    read: true,
  },
  {
    id: '5',
    from: 'noreply@fakebank.com',
    subject: 'Urgent: Verify your account now or it will be suspended',
    preview: 'Your account has been flagged. Click here to verify within 24 hours...',
    time: 'Mon',
    tag: 'phishing',
    read: true,
  },
];

const FILTERS = ['All', 'Important', 'Phishing', 'Unread'];

// ── Sub-components ────────────────────────────────────────────
function TagBadge({ tag }) {
  if (!tag) return null;
  if (tag === 'phishing') {
    return (
      <View style={[badge.wrap, { backgroundColor: '#FEE2E2' }]}>
        <MaterialCommunityIcons name="alert-circle" size={10} color="#DC2626" />
        <Text style={[badge.text, { color: '#DC2626' }]}> PHISHING</Text>
      </View>
    );
  }
  return (
    <View style={[badge.wrap, { backgroundColor: '#EEF2FF' }]}>
      <MaterialCommunityIcons name="star" size={10} color="#4F46E5" />
      <Text style={[badge.text, { color: '#4F46E5' }]}> IMPORTANT</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  text: { fontSize: FONT.xs, fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────
export default function GmailScreen() {
  const insets              = useSafeAreaInsets();
  const [activeFilter, setFilter] = useState('All');
  const [emailList, setEmailList] = useState(DEMO_EMAILS);
  const [loading, setLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadGoogleEmails = async () => {
      setLoading(true);
      const res = await GoogleServices.getGmailMessages(15);
      if (isMounted && res.success && res.emails && res.emails.length > 0) {
        const mapped = res.emails.map((e) => ({
          id: e.id,
          from: e.sender,
          subject: e.subject,
          preview: e.snippet,
          time: e.date,
          tag: e.labels?.includes('IMPORTANT') ? 'important' : null,
          read: !e.labels?.includes('UNREAD'),
        }));
        setEmailList(mapped);
        setIsGoogleConnected(true);
      }
      if (isMounted) setLoading(false);
    };
    loadGoogleEmails();
    return () => { isMounted = false; };
  }, []);

  const filtered = emailList.filter((e) => {
    if (activeFilter === 'Important') return e.tag === 'important';
    if (activeFilter === 'Phishing')  return e.tag === 'phishing';
    if (activeFilter === 'Unread')    return !e.read;
    return true;
  });

  const phishingCount = emailList.filter((e) => e.tag === 'phishing').length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.heading}>AI Email Assistant</Text>
          <Text style={styles.subheading}>
            {isGoogleConnected ? `${emailList.length} emails synced` : `${emailList.length} preview emails`} · {phishingCount} threats detected
          </Text>
        </View>

        <TouchableOpacity style={styles.scanBtn}>
          <MaterialCommunityIcons name="shield-search" size={18} color={COLORS.primary} />
          <Text style={styles.scanBtnText}> Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Phishing Alert */}
      {phishingCount > 0 && (
        <View style={styles.alert}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text style={styles.alertText}>
            {' '}
            {phishingCount} phishing email{phishingCount > 1 ? 's' : ''} detected — review carefully
          </Text>
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Email List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="email-check-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No emails in this category</Text>
            <Text style={styles.emptySub}>All emails have been reviewed</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.emailCard,
              !item.read           && styles.emailUnread,
              item.tag === 'phishing' && styles.emailPhishing,
            ]}
            onPress={() => router.push({ pathname: '/email-details', params: { id: item.id } })}
            activeOpacity={0.8}
          >
            {/* Avatar */}
            <View
              style={[
                styles.avatar,
                { backgroundColor: item.tag === 'phishing' ? '#FEE2E2' : '#EEF2FF' },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: item.tag === 'phishing' ? '#DC2626' : COLORS.primary },
                ]}
              >
                {item.from[0]}
              </Text>
            </View>

            {/* Body */}
            <View style={styles.emailBody}>
              <View style={styles.emailRow}>
                <Text style={[styles.emailFrom, !item.read && styles.bold]}>
                  {item.from}
                </Text>
                <Text style={styles.emailTime}>{item.time}</Text>
              </View>
              <Text
                style={[styles.emailSubject, !item.read && styles.bold]}
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <Text style={styles.emailPreview} numberOfLines={1}>
                {item.preview}
              </Text>
              <TagBadge tag={item.tag} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  heading:    { fontSize: FONT.xl, fontWeight: '800', color: '#0F172A' },
  subheading: { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  scanBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT.sm },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  alertText: { color: '#DC2626', fontSize: FONT.sm, fontWeight: '600' },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#E2E8F0',
  },
  chipActive:     { backgroundColor: COLORS.primary },
  chipText:       { fontSize: FONT.sm, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  emailCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  emailUnread:   { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  emailPhishing: { borderLeftWidth: 3, borderLeftColor: '#DC2626' },

  avatar:     { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: FONT.md },

  emailBody:    { flex: 1 },
  emailRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emailFrom:    { fontSize: FONT.md, color: '#0F172A' },
  bold:         { fontWeight: '700' },
  emailTime:    { fontSize: FONT.sm, color: '#94A3B8' },
  emailSubject: { fontSize: FONT.sm, color: '#334155', marginTop: 2 },
  emailPreview: { fontSize: FONT.sm, color: '#94A3B8', marginTop: 2 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: FONT.sm,
    color: '#64748B',
    marginTop: 4,
  },
});
