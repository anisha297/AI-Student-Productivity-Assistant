import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import GoogleServices from '../services/googleServices';
import { useGoogleAuth } from '../services/googleAuth';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { signInWithGoogle } = useGoogleAuth('/settings');

  const [notifications,   setNotifications]   = useState(true);
  const [emailAlerts,     setEmailAlerts]      = useState(true);
  const [phishingWarning, setPhishingWarning]  = useState(true);
  const [darkMode,        setDarkMode]         = useState(false);

  // Google Connected Services state
  const [googleStatus, setGoogleStatus] = useState({
    connected: false,
    email: '',
    services: { gmail: false, classroom: false, calendar: false },
  });
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchGoogleStatus = useCallback(async () => {
    setLoadingGoogle(true);
    const res = await GoogleServices.getConnectionStatus();
    if (res.success && res.data) {
      setGoogleStatus({
        connected: !!res.data.connected,
        email: res.data.email || user?.email || '',
        services: res.data.services || {
          gmail: res.data.scopes?.some((s) => s.includes('gmail')) || false,
          classroom: res.data.scopes?.some((s) => s.includes('classroom')) || false,
          calendar: res.data.scopes?.some((s) => s.includes('calendar')) || false,
        },
      });
    } else {
      setGoogleStatus({
        connected: !!user?.google_connected,
        email: user?.google_email || user?.email || '',
        services: user?.google_services || { gmail: false, classroom: false, calendar: false },
      });
    }
    setLoadingGoogle(false);
  }, [user]);

  useEffect(() => {
    fetchGoogleStatus();
  }, [fetchGoogleStatus]);

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Google Account',
      'Are you sure you want to disconnect your Google account? Live syncing for Gmail, Classroom, and Calendar will be paused.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setDisconnecting(true);
            const res = await GoogleServices.disconnectGoogleAccount();
            setDisconnecting(false);
            if (res.success) {
              setGoogleStatus({
                connected: false,
                email: '',
                services: { gmail: false, classroom: false, calendar: false },
              });
              Alert.alert('Disconnected', 'Google account has been disconnected.');
            } else {
              Alert.alert('Error', res.error || 'Failed to disconnect account.');
            }
          },
        },
      ]
    );
  };

  const sections = [
    {
      title: 'NOTIFICATIONS',
      items: [
        { label: 'Push Notifications', sub: 'Receive task & deadline alerts', value: notifications, onChange: setNotifications },
        { label: 'SMS & WhatsApp Alerts (+91)', sub: user?.profile?.phone_number ? `Delivering to ${user.profile.phone_number}` : 'Tap to register +91 phone number', value: !!user?.profile?.phone_number, onChange: () => router.push('/edit-profile') },
        { label: 'Email Alerts',        sub: 'Alert on important emails',      value: emailAlerts,    onChange: setEmailAlerts    },
        { label: 'Phishing Warnings',   sub: 'Security threat notifications',  value: phishingWarning,onChange: setPhishingWarning },
      ],
    },
    {
      title: 'APPEARANCE',
      items: [
        { label: 'Dark Mode', sub: 'Dark theme will be available in an upcoming update', value: darkMode, onChange: setDarkMode, disabled: true },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.heading}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Google Connected Services ───────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GOOGLE ACCOUNT & CONNECTED SERVICES</Text>
          <View style={styles.googleCard}>
            <View style={styles.googleHeader}>
              <View style={styles.googleIconWrap}>
                <MaterialCommunityIcons name="google" size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.googleTitle}>Google Account</Text>
                {loadingGoogle ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start', marginTop: 2 }} />
                ) : (
                  <Text style={styles.googleEmail} numberOfLines={1}>
                    {googleStatus.connected ? googleStatus.email : 'Not connected'}
                  </Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: googleStatus.connected ? '#DCFCE7' : '#F1F5F9' }]}>
                <Text style={[styles.statusBadgeText, { color: googleStatus.connected ? '#166534' : '#64748B' }]}>
                  {googleStatus.connected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>

            {/* Service checklist */}
            <View style={styles.servicesWrap}>
              <Text style={styles.servicesHeaderLabel}>Connected Services</Text>

              <View style={styles.serviceRow}>
                <MaterialCommunityIcons
                  name={googleStatus.connected && googleStatus.services.gmail ? 'check-circle' : 'circle-outline'}
                  size={18}
                  color={googleStatus.connected && googleStatus.services.gmail ? '#059669' : '#94A3B8'}
                />
                <Text style={styles.serviceName}>Gmail</Text>
                <Text style={styles.serviceDesc}>Email assistant & threat scanner</Text>
              </View>

              <View style={styles.serviceRow}>
                <MaterialCommunityIcons
                  name={googleStatus.connected && googleStatus.services.classroom ? 'check-circle' : 'circle-outline'}
                  size={18}
                  color={googleStatus.connected && googleStatus.services.classroom ? '#059669' : '#94A3B8'}
                />
                <Text style={styles.serviceName}>Google Classroom</Text>
                <Text style={styles.serviceDesc}>Enrolled courses & coursework</Text>
              </View>

              <View style={styles.serviceRow}>
                <MaterialCommunityIcons
                  name={googleStatus.connected && googleStatus.services.calendar ? 'check-circle' : 'circle-outline'}
                  size={18}
                  color={googleStatus.connected && googleStatus.services.calendar ? '#059669' : '#94A3B8'}
                />
                <Text style={styles.serviceName}>Google Calendar</Text>
                <Text style={styles.serviceDesc}>Schedule & assignment deadlines</Text>
              </View>
            </View>

            {/* Google Permissions Button */}
            <View style={styles.googleActions}>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={signInWithGoogle}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="shield-key-outline" size={18} color="#FFFFFF" />
                <Text style={styles.manageBtnText}>
                  {googleStatus.connected ? 'Manage Google Permissions' : 'Connect Google Services'}
                </Text>
              </TouchableOpacity>

              {googleStatus.connected ? (
                <TouchableOpacity
                  style={styles.disconnectBtn}
                  onPress={handleDisconnect}
                  disabled={disconnecting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.disconnectText}>
                    {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── App Preferences ─────────────────────────────────── */}
        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{sec.title}</Text>
            {sec.items.map((item, i) => (
              <View key={i} style={[styles.settingRow, item.disabled && styles.rowDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.disabled ? undefined : item.onChange}
                  trackColor={{ false: '#E2E8F0', true: '#818CF8' }}
                  thumbColor={item.value ? COLORS.primary : '#94A3B8'}
                  disabled={!!item.disabled}
                />
              </View>
            ))}
          </View>
        ))}

        {/* ── Account Management ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {[
            { icon: 'account-edit-outline', label: 'Edit Profile',    route: '/edit-profile' },
            { icon: 'lock-outline',          label: 'Change Password', route: '/change-password' },
            { icon: 'help-circle-outline',   label: 'Help & Support',  route: null       },
            { icon: 'information-outline',   label: 'About App',       route: null       },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuRow}
              onPress={() => item.route && router.push(item.route)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={item.icon} size={20} color={COLORS.primary} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>
          AI Student Productivity v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F8F9FF' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  content: { padding: SPACING.lg, paddingBottom: 60 },

  section:      { marginBottom: SPACING.lg },
  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.sm, letterSpacing: 1 },

  // Google Card
  googleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm,
  },
  googleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  googleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleTitle: { fontSize: FONT.xs, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  googleEmail: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: { fontSize: FONT.xs, fontWeight: '700' },

  servicesWrap: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  servicesHeaderLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#475569',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#0F172A',
    width: 130,
  },
  serviceDesc: {
    fontSize: FONT.xs,
    color: '#64748B',
    flex: 1,
  },

  googleActions: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT.sm,
  },
  disconnectBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  disconnectText: {
    color: '#DC2626',
    fontSize: FONT.xs,
    fontWeight: '600',
  },

  settingRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  rowDisabled:    { opacity: 0.5 },
  settingLabel:   { fontSize: FONT.md, fontWeight: '600', color: '#0F172A' },
  settingSub:     { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },

  menuRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  menuIcon: { marginRight: SPACING.md },
  menuLabel:{ flex: 1, fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },

  version: { textAlign: 'center', color: '#94A3B8', fontSize: FONT.sm, marginTop: SPACING.md },
});
