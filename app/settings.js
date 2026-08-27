import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications,   setNotifications]   = useState(true);
  const [emailAlerts,     setEmailAlerts]      = useState(true);
  const [phishingWarning, setPhishingWarning]  = useState(true);
  const [darkMode,        setDarkMode]         = useState(false);

  const sections = [
    {
      title: 'NOTIFICATIONS',
      items: [
        { label: 'Push Notifications', sub: 'Receive task & deadline alerts', value: notifications, onChange: setNotifications },
        { label: 'Email Alerts',        sub: 'Alert on important emails',      value: emailAlerts,    onChange: setEmailAlerts    },
        { label: 'Phishing Warnings',   sub: 'Security threat notifications',  value: phishingWarning,onChange: setPhishingWarning },
      ],
    },
    {
      title: 'APPEARANCE',
      items: [
        { label: 'Dark Mode', sub: 'Switch to dark theme (Phase 2)', value: darkMode, onChange: setDarkMode, disabled: true },
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {[
            { icon: 'account-edit-outline', label: 'Edit Profile',    route: '/profile' },
            { icon: 'lock-outline',          label: 'Change Password', route: null       },
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
          AI Student Productivity v1.0.0 · Phase 1
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

  settingRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  rowDisabled:    { opacity: 0.5 },
  settingLabel:   { fontSize: FONT.md, fontWeight: '600', color: '#0F172A' },
  settingSub:     { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },

  menuRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  menuIcon: { marginRight: SPACING.md },
  menuLabel:{ flex: 1, fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },

  version: { textAlign: 'center', color: '#94A3B8', fontSize: FONT.sm, marginTop: SPACING.md },
});
