import React, { useState, useEffect } from 'react';
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
import GoogleServices from '../services/googleServices';

// ── Demo Courses ──────────────────────────────────────────────
const DEMO_COURSES = [
  { id: '1', name: 'Data Structures & Algorithms', code: 'CS301', pending: 2, color: '#4F46E5' },
  { id: '2', name: 'Software Engineering',          code: 'CS401', pending: 1, color: '#7C3AED' },
  { id: '3', name: 'Advanced Calculus',             code: 'MA201', pending: 3, color: '#0891B2' },
  { id: '4', name: 'Physics Lab',                   code: 'PH102', pending: 0, color: '#059669' },
];

export default function ClassroomScreen() {
  const insets = useSafeAreaInsets();
  const [coursesList, setCoursesList] = useState(DEMO_COURSES);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      const res = await GoogleServices.getClassroomCourses();
      if (isMounted && res.success && res.courses && res.courses.length > 0) {
        const colors = ['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#EA580C'];
        const mapped = res.courses.map((c, i) => {
          const pendingCount = c.assignments?.filter((a) => !a.submission || a.submission.state !== 'TURNED_IN').length || 0;
          return {
            id: c.course_id || `course-${i}`,
            name: c.course_name,
            code: c.section || `C${i + 1}`,
            pending: pendingCount,
            color: colors[i % colors.length],
          };
        });
        setCoursesList(mapped);
        setIsGoogleConnected(true);
      }
    };
    loadCourses();
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.heading}>Google Classroom</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon block */}
        <View style={styles.iconBlock}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="school-outline" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.title}>Your Courses</Text>
          <Text style={styles.subtitle}>
            {isGoogleConnected ? 'Synced with your Google Classroom account' : 'Track your enrolled courses and upcoming coursework'}
          </Text>
        </View>

        {/* Course Cards */}
        <Text style={styles.sectionLabel}>ENROLLED COURSES</Text>
        {coursesList.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={[styles.courseLeft, { backgroundColor: course.color }]}>
              <Text style={styles.courseCode}>{course.code}</Text>
            </View>
            <View style={styles.courseBody}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={[styles.coursePending, { color: course.pending > 0 ? COLORS.danger : '#059669' }]}>
                {course.pending > 0 ? `${course.pending} assignment${course.pending > 1 ? 's' : ''} pending` : 'All up to date ✓'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
          </View>
        ))}

        {/* Sync Status Card */}
        <View style={styles.syncCard}>
          <MaterialCommunityIcons
            name={isGoogleConnected ? 'check-decagram' : 'cloud-sync-outline'}
            size={24}
            color={COLORS.primary}
          />
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.syncTitle}>
              {isGoogleConnected ? 'Classroom Synced' : 'Classroom Sync'}
            </Text>
            <Text style={styles.syncText}>
              {isGoogleConnected
                ? 'Your coursework and assignments are up to date.'
                : 'Connect your Google account in Settings to synchronize your university classroom data.'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: '#F8F9FF',
  },
  heading: { fontSize: FONT.lg, fontWeight: '700', color: '#0F172A' },
  content: { padding: SPACING.lg, paddingBottom: 60 },

  iconBlock:  { alignItems: 'center', marginBottom: SPACING.xl },
  iconCircle: { width: 90, height: 90, borderRadius: RADIUS.full, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  title:    { fontSize: FONT.xxl, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: FONT.sm, color: '#64748B', marginTop: 4, textAlign: 'center' },

  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.sm, letterSpacing: 1 },
  courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.sm },
  courseLeft: { width: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md },
  courseCode: { color: '#FFFFFF', fontWeight: '800', fontSize: FONT.sm },
  courseBody: { flex: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  courseName: { fontSize: FONT.md, fontWeight: '700', color: '#0F172A' },
  coursePending: { fontSize: FONT.sm, marginTop: 4, fontWeight: '600' },

  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncTitle: { fontSize: FONT.sm, fontWeight: '700', color: '#0F172A' },
  syncText:  { fontSize: FONT.xs, color: '#64748B', marginTop: 2, lineHeight: 18 },
});
