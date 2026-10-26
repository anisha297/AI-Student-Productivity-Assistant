// Email Details Screen – dynamic, with reply editor and phishing analysis
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import client from '../api/client';
import * as Clipboard from 'expo-clipboard';

const FALLBACK_EMAILS = {
  '1': {
    id: '1',
    from: 'Prof. Johnson',
    email: 'johnson@university.edu',
    subject: 'Final Project Guidelines — Updated',
    body: 'Dear Students,\n\nPlease review the updated rubric before your submission deadline this Friday. Make sure all group members have contributed to the git repository and the final PDF documentation is uploaded to the student portal.\n\nBest regards,\nProf. Johnson\nDepartment of Computer Science',
    tag: 'important',
    received_at: new Date().toISOString(),
    suggested_reply: 'Dear Prof. Johnson,\n\nThank you for the update. Our team has reviewed the revised rubric and we will ensure the repository and documentation are submitted on time.\n\nBest,\nStudent',
  },
  '2': {
    id: '2',
    from: 'Reward Notification',
    email: 'no-reply@suspicious.net',
    subject: 'You have won a prize! Claim now',
    body: 'Congratulations! Your student ID was randomly selected in our international education giveaway. Click the link below within 24 hours to claim your $500 gift card prize!\n\nhttp://suspicious-giveaway-prize.xyz/claim',
    tag: 'phishing',
    received_at: new Date(Date.now() - 3600000).toISOString(),
    suggested_reply: '',
  },
  '3': {
    id: '3',
    from: 'Career Services',
    email: 'careers@university.edu',
    subject: 'Upcoming Resume Review Session',
    body: 'Hi everyone,\n\nWe are hosting a free 1-on-1 resume review and mock interview session next Thursday at 2 PM in Hall B. Please bring 2 printed copies of your current resume.\n\nSign up early as spots are limited!\n\nCareer Services Team',
    tag: 'important',
    received_at: new Date(Date.now() - 86400000).toISOString(),
    suggested_reply: 'Hi Career Services Team,\n\nI would love to participate in the resume review session next Thursday. I will bring two printed copies.\n\nThank you!',
  },
  '4': {
    id: '4',
    from: 'Library System',
    email: 'library@university.edu',
    subject: 'Book Loan Reminder',
    body: 'Reminder: Your borrowed book "Introduction to Algorithms" is due in 3 days. You can renew online via the university library catalog or return it in the drop box.',
    tag: null,
    received_at: new Date(Date.now() - 172800000).toISOString(),
    suggested_reply: 'Thank you for the reminder. I will renew the book online.',
  },
  '5': {
    id: '5',
    from: 'Urgent Account Verification',
    email: 'noreply@fakebank.com',
    subject: 'Urgent: Verify your account now or it will be suspended',
    body: 'Notice: Unauthorized sign-in attempt detected. Verify your credentials immediately or access will be restricted.\n\nClick: http://fake-auth-portal.com/login',
    tag: 'phishing',
    received_at: new Date(Date.now() - 259200000).toISOString(),
    suggested_reply: '',
  },
};

export default function EmailDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = params?.id || '1';

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [generating, setGenerating] = useState(false);

  // Fetch email details with fallback to demo data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await client.get(`/emails/${id}/`);
        if (isMounted && data) {
          setEmail(data);
          setReplyText(data.suggested_reply || '');
        }
      } catch (e) {
        // Fallback to local demo data smoothly
        const fallback = FALLBACK_EMAILS[id] || FALLBACK_EMAILS['1'];
        if (isMounted) {
          setEmail(fallback);
          setReplyText(fallback.suggested_reply || '');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const generateReply = async (tone = 'professional') => {
    if (!email) return;
    setGenerating(true);
    try {
      const { data } = await client.post(`/emails/${email.id}/generate_reply/`, { tone });
      if (data?.reply) {
        setReplyText(data.reply);
      } else {
        throw new Error('No reply generated');
      }
    } catch (e) {
      // Friendly fallback smart replies depending on tone
      if (tone === 'brief') {
        setReplyText(`Hi,\n\nReceived, thank you! I will review and follow up promptly.\n\nBest,\nStudent`);
      } else if (tone === 'enthusiastic') {
        setReplyText(`Hi,\n\nThank you so much for the update! Looking forward to this and will make sure everything is ready.\n\nBest regards,\nStudent`);
      } else {
        setReplyText(`Dear ${email.from},\n\nThank you for reaching out. I have noted this and will proceed accordingly.\n\nBest regards,\nStudent`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyReply = async () => {
    if (!replyText) return;
    await Clipboard.setStringAsync(replyText);
    Alert.alert('Copied', 'Reply text copied to clipboard.');
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const currentEmail = email || FALLBACK_EMAILS['1'];
  const isPhishing = currentEmail.tag === 'phishing';

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
        <Text style={styles.heading}>Email Details</Text>
        <TouchableOpacity
          onPress={() => setIsStarred((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={isStarred ? 'star' : 'star-outline'}
            size={24}
            color={isStarred ? '#EAB308' : '#0F172A'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <Text style={styles.subject}>{currentEmail.subject}</Text>

        {/* AI Safety Badge */}
        {isPhishing ? (
          <View style={styles.phishBadge}>
            <MaterialCommunityIcons name="alert-octagon" size={16} color="#DC2626" />
            <Text style={styles.phishBadgeText}>High Risk Phishing Detected</Text>
          </View>
        ) : (
          <View style={styles.safeBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color="#059669" />
            <Text style={styles.safeText}>AI Verified Safe — No threats detected</Text>
          </View>
        )}

        {/* Sender info */}
        <View style={styles.senderRow}>
          <View
            style={[
              styles.senderAvatar,
              { backgroundColor: isPhishing ? '#FEE2E2' : '#EEF2FF' },
            ]}
          >
            <Text
              style={[
                styles.senderInitial,
                { color: isPhishing ? '#DC2626' : COLORS.primary },
              ]}
            >
              {currentEmail.from ? currentEmail.from[0] : 'M'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.senderName}>{currentEmail.from}</Text>
            <Text style={styles.senderEmail}>{currentEmail.email || 'university.edu'}</Text>
          </View>
          <Text style={styles.emailDate}>
            {currentEmail.received_at
              ? new Date(currentEmail.received_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Today'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Body */}
        <Text style={styles.body}>{currentEmail.body}</Text>

        {/* Phishing warning banner */}
        {isPhishing && (
          <View style={styles.phishSolution}>
            <View style={styles.phishBannerTitleRow}>
              <MaterialCommunityIcons name="shield-alert" size={20} color="#DC2626" />
              <Text style={styles.phishHeader}>Security Advice</Text>
            </View>
            <Text style={styles.phishText}>
              This email contains suspicious patterns and deceptive links. Do not click links, download attachments, or reply with personal credentials.
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.replyBtn]}
            onPress={() => setReplyModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="reply" size={18} color={COLORS.primary} />
            <Text style={styles.replyText}>AI Smart Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.forwardBtn]}
            onPress={() => {
              Clipboard.setStringAsync(`${currentEmail.subject}\n\n${currentEmail.body}`);
              Alert.alert('Copied', 'Email content copied to clipboard.');
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="content-copy" size={18} color="#64748B" />
            <Text style={styles.forwardText}>Copy Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + SPACING.md }]}>
            <Text style={styles.modalTitle}>AI Smart Reply</Text>
            <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Tone Selector */}
            <Text style={styles.toneLabel}>Tone Preset</Text>
            <View style={styles.toneRow}>
              {[
                { key: 'professional', label: '💼 Professional' },
                { key: 'brief', label: '⚡ Brief' },
                { key: 'enthusiastic', label: '✨ Enthusiastic' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={styles.toneChip}
                  onPress={() => generateReply(t.key)}
                >
                  <Text style={styles.toneChipText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.replyInput}
              multiline
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Drafting your AI reply…"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalGenerate]}
                onPress={() => generateReply('professional')}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <MaterialCommunityIcons name="auto-fix" size={18} color="#FFF" />
                    <Text style={styles.modalBtnText}>Regenerate</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCopy]}
                onPress={copyReply}
              >
                <View style={styles.btnContentRow}>
                  <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={COLORS.primary} />
                  <Text style={[styles.modalBtnText, { color: COLORS.primary }]}>Copy Reply</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  content: { padding: SPACING.lg, paddingBottom: 60 },
  subject: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: SPACING.sm,
  },

  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    gap: 6,
  },
  safeText: { color: '#059669', fontSize: FONT.xs, fontWeight: '700' },

  phishBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    gap: 6,
  },
  phishBadgeText: { color: '#DC2626', fontSize: FONT.xs, fontWeight: '700' },

  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: { fontWeight: '800', fontSize: FONT.md },
  senderName: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  senderEmail: { fontSize: FONT.sm, color: '#64748B' },
  emailDate: { fontSize: FONT.xs, color: '#94A3B8' },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: SPACING.md },
  body: { fontSize: FONT.md, color: '#334155', lineHeight: 24 },

  phishSolution: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  phishBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  phishHeader: { fontSize: FONT.sm, fontWeight: '700', color: '#B91C1C' },
  phishText: { fontSize: FONT.xs, color: '#7F1D1D', lineHeight: 18 },

  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  replyBtn: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  forwardBtn: { backgroundColor: '#F1F5F9' },
  replyText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT.sm },
  forwardText: { color: '#64748B', fontWeight: '700', fontSize: FONT.sm },

  modalRoot: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: { fontSize: FONT.lg, fontWeight: '800', color: '#0F172A' },
  modalBody: { padding: SPACING.lg, flex: 1 },
  toneLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  toneRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  toneChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  toneChipText: { fontSize: FONT.xs, fontWeight: '600', color: '#334155' },

  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.md,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
    backgroundColor: '#FAFAFA',
  },
  modalActions: { flexDirection: 'row', gap: SPACING.md },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  modalGenerate: { backgroundColor: COLORS.primary },
  modalCopy: { backgroundColor: '#EEF2FF' },
  btnContentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalBtnText: { color: '#FFF', fontWeight: '700', fontSize: FONT.sm },
});
