import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AppButton from '../components/AppButton';
import FeatureCard from '../components/FeatureCard';
import { SPACING, FONT, RADIUS, COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import useGoogleAuth from '../services/googleAuth';

const FEATURES = [
  {
    icon: 'email-outline',
    title: 'AI Email Assistant',
    description: 'Smart summaries & threat detection',
    color: '#4F46E5',
  },
  {
    icon: 'school-outline',
    title: 'Google Classroom',
    description: 'Assignments & deadlines unified',
    color: '#7C3AED',
  },
  {
    icon: 'checkbox-marked-circle-outline',
    title: 'Smart Tasks',
    description: 'AI-prioritised to-do management',
    color: '#0891B2',
  },
  {
    icon: 'robot-outline',
    title: 'Daily AI Briefing',
    description: 'Your personalised briefing',
    color: '#059669',
  },
  {
    icon: 'shield-check-outline',
    title: 'Email Security',
    description: 'Phishing & spam protection',
    color: '#DC2626',
  },
  {
    icon: 'chart-line',
    title: 'Productivity Analytics',
    description: 'Track your study habits',
    color: '#D97706',
  },
];

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero Section ────────────────────────────────── */}
        <SafeAreaView style={styles.hero} edges={['top']}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          {/* App name */}
          <Text style={styles.appName}>AI Student</Text>
          <Text style={styles.appSub}>Productivity &amp; Security Assistant</Text>

          {/* Project badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              🎓 Final Year BSc Computer Science Project
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            An AI-powered assistant to help you manage academics, productivity,
            emails, deadlines and digital security — all in one place.
          </Text>

          {/* CTA Buttons */}
          <View style={styles.btnGroup}>
            <AppButton
              label="Login"
              onPress={() => router.push('/login')}
              style={styles.btnFull}
            />
            <AppButton
              label="Create Account"
              variant="outlined"
              onPress={() => router.push('/register')}
              style={[styles.btnFull, styles.btnOutlinedDark]}
            />
            <AppButton
              label="Continue with Google"
              variant="google"
              onPress={signInWithGoogle}
              style={styles.btnFull}
            />
          </View>
        </SafeAreaView>

        {/* ── Features Section ────────────────────────────── */}
        <View style={styles.featuresWrap}>
          <Text style={styles.featuresTitle}>Everything You Need</Text>
          <Text style={styles.featuresSub}>
            Powered by AI to supercharge your student life
          </Text>

          {/* 2-column grid */}
          <View style={styles.grid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.gridCell}>
                <FeatureCard {...f} />
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            Built with React Native &amp; Expo · AI Student Productivity v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Hero ──
  hero: {
    backgroundColor: '#0F172A',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  logoWrap: {
    marginTop: SPACING.xl,
    width: 90,
    height: 90,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSub: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A5B4FC',
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  badge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: FONT.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: FONT.md,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  btnGroup: {
    width: '100%',
    gap: SPACING.sm,
  },
  btnFull: {
    width: '100%',
  },
  btnOutlinedDark: {
    borderColor: '#4F46E5',
  },

  // ── Features ──
  featuresWrap: {
    backgroundColor: '#111827',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  featuresTitle: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  featuresSub: {
    fontSize: FONT.md,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  gridCell: {
    width: '50%',
  },
  footer: {
    textAlign: 'center',
    color: '#475569',
    fontSize: FONT.xs,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
