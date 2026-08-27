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

// Mock email being viewed
const EMAIL = {
  from:    'Prof. Johnson',
  email:   'johnson@university.edu',
  subject: 'Final Project Guidelines — Updated',
  date:    'Today, 9:30 AM',
  body: `Dear Students,

I hope this message finds you well.

Please find attached the updated rubric for your Final Year Project submission. There are some important changes to the evaluation criteria that you should review carefully before your submission.

Key changes:
• Section 3 (Methodology) now carries 25 marks instead of 20.
• A new Section 7 (Demonstration) has been added (10 marks).
• Submission deadline remains Friday at 11:59 PM.

Please ensure you adhere to the word count guidelines as outlined in the document. If you have any questions, my office hours are on Tuesday and Thursday from 2:00 PM to 4:00 PM.

Best regards,
Prof. Johnson
Department of Computer Science`,
  tag: 'important',
};

export default function EmailDetailsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.heading}>Email</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <Text style={styles.subject}>{EMAIL.subject}</Text>

        {/* AI Safety Badge */}
        <View style={styles.safeBadge}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#059669" />
          <Text style={styles.safeText}> AI Verified Safe — No threats detected</Text>
        </View>

        {/* Sender info */}
        <View style={styles.senderRow}>
          <View style={styles.senderAvatar}>
            <Text style={styles.senderInitial}>{EMAIL.from[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.senderName}>{EMAIL.from}</Text>
            <Text style={styles.senderEmail}>{EMAIL.email}</Text>
          </View>
          <Text style={styles.emailDate}>{EMAIL.date}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Body */}
        <Text style={styles.body}>{EMAIL.body}</Text>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.replyBtn]}>
            <MaterialCommunityIcons name="reply" size={18} color={COLORS.primary} />
            <Text style={styles.replyText}> Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.forwardBtn]}>
            <MaterialCommunityIcons name="forward" size={18} color="#64748B" />
            <Text style={styles.forwardText}> Forward</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseText}>
            ✨ AI email summarisation, action-item extraction, and smart reply suggestions will be available in Phase 2.
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

  subject: { fontSize: FONT.xl, fontWeight: '800', color: '#0F172A', marginBottom: SPACING.sm },
  safeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: SPACING.md },
  safeText: { color: '#059669', fontSize: FONT.sm, fontWeight: '600' },

  senderRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  senderAvatar:  { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  senderInitial: { fontWeight: '800', fontSize: FONT.md, color: COLORS.primary },
  senderName:    { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  senderEmail:   { fontSize: FONT.sm, color: '#64748B' },
  emailDate:     { fontSize: FONT.sm, color: '#94A3B8' },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: SPACING.md },
  body:    { fontSize: FONT.md, color: '#334155', lineHeight: 24 },

  actions:    { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.md, borderRadius: RADIUS.md },
  replyBtn:   { backgroundColor: '#EEF2FF' },
  forwardBtn: { backgroundColor: '#F1F5F9' },
  replyText:  { color: COLORS.primary, fontWeight: '700', fontSize: FONT.md },
  forwardText:{ color: '#64748B',      fontWeight: '700', fontSize: FONT.md },

  phaseCard: { backgroundColor: '#EEF2FF', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md },
  phaseText: { color: '#4F46E5', fontSize: FONT.sm, textAlign: 'center', lineHeight: 20 },
});
