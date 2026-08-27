import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: '1', title: 'Data Structures Assignment',       due: 'Today, 11:59 PM',   priority: 'high',   subject: 'Computer Science', done: false },
  { id: '2', title: 'Review Calculus Chapter 5 notes',  due: 'Tomorrow, 9:00 AM', priority: 'medium', subject: 'Mathematics',      done: false },
  { id: '3', title: 'Prepare FYP presentation slides',  due: 'Friday',            priority: 'high',   subject: 'Final Year Project', done: false },
  { id: '4', title: 'Read SE Chapter 3',                due: 'Next week',         priority: 'low',    subject: 'Software Eng.',    done: false },
  { id: '5', title: 'Physics Lab Report',               due: 'Yesterday',         priority: 'high',   subject: 'Physics',          done: true  },
  { id: '6', title: 'Buy stationery',                   due: 'No due date',       priority: 'low',    subject: 'Personal',         done: true  },
];

const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#059669' };

// ── Main Screen ───────────────────────────────────────────────
export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [tasks,    setTasks]    = useState(INITIAL_TASKS);
  const [showAdd,  setShowAdd]  = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const pending   = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) =>  t.done);

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks((prev) => [
      {
        id:       String(Date.now()),
        title:    newTitle.trim(),
        due:      'No due date',
        priority: 'medium',
        subject:  'General',
        done:     false,
      },
      ...prev,
    ]);
    setNewTitle('');
    setShowAdd(false);
  };

  const allItems = [
    { type: 'header', label: 'PENDING',   key: 'h-pending' },
    ...pending.map((t)   => ({ type: 'task', ...t })),
    { type: 'header', label: 'COMPLETED', key: 'h-completed' },
    ...completed.map((t) => ({ type: 'task', ...t })),
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.heading}>Smart Tasks</Text>
          <Text style={styles.subheading}>
            {pending.length} pending · {completed.length} completed
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd((v) => !v)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name={showAdd ? 'close' : 'plus'} size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Add Task inline card */}
      {showAdd && (
        <View style={styles.addCard}>
          <TextInput
            style={styles.addInput}
            placeholder="Enter task title..."
            placeholderTextColor="#94A3B8"
            value={newTitle}
            onChangeText={setNewTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={addTask}
          />
          <View style={styles.addActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowAdd(false); setNewTitle(''); }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={addTask}>
              <Text style={styles.saveText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.key || item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={[styles.sectionLabel, item.label === 'COMPLETED' && { marginTop: SPACING.md }]}>
                {item.label}
              </Text>
            );
          }
          return (
            <TouchableOpacity
              style={[styles.taskCard, item.done && styles.taskDone]}
              onPress={() => toggleTask(item.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={item.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={24}
                color={item.done ? '#059669' : PRIORITY_COLORS[item.priority]}
              />
              <View style={styles.taskBody}>
                <Text style={[styles.taskTitle, item.done && styles.taskStrike]}>
                  {item.title}
                </Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskSubject}>{item.subject}</Text>
                  <Text style={styles.taskDue}>{item.due}</Text>
                </View>
              </View>
              {!item.done && (
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
              )}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  addInput: {
    fontSize: FONT.md,
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: SPACING.sm,
  },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.md },
  cancelBtn:  { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  cancelText: { color: '#64748B', fontWeight: '600' },
  saveBtn:    { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  saveText:   { color: '#FFFFFF', fontWeight: '700' },

  sectionLabel: { fontSize: FONT.xs, fontWeight: '700', color: '#94A3B8', marginBottom: SPACING.sm, letterSpacing: 1 },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  taskDone:   { opacity: 0.55 },
  taskBody:   { flex: 1 },
  taskTitle:  { fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },
  taskStrike: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskMeta:   { flexDirection: 'row', gap: SPACING.md, marginTop: 4 },
  taskSubject: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  taskDue:    { fontSize: FONT.sm, color: '#94A3B8' },
  priorityDot: { width: 8, height: 8, borderRadius: RADIUS.full },
});
