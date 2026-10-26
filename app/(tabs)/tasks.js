import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import NotificationService from '../../services/notificationService';

// ── Initial Tasks ─────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: '1', title: 'Data Structures Assignment',       due: 'Today, 11:59 PM',   priority: 'high',   subject: 'Computer Science', done: false },
  { id: '2', title: 'Review Calculus Chapter 5 notes',  due: 'Tomorrow, 9:00 AM', priority: 'medium', subject: 'Mathematics',      done: false },
  { id: '3', title: 'Prepare FYP presentation slides',  due: 'Friday',            priority: 'high',   subject: 'Final Year Project', done: false },
  { id: '4', title: 'Read SE Chapter 3',                due: 'Next week',         priority: 'low',    subject: 'Software Eng.',    done: false },
  { id: '5', title: 'Physics Lab Report',               due: 'Yesterday',         priority: 'high',   subject: 'Physics',          done: true  },
  { id: '6', title: 'Buy stationery',                   due: 'No due date',       priority: 'low',    subject: 'Personal',         done: true  },
];

const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#059669' };
const FILTERS = ['All', 'Pending', 'High Priority', 'Completed'];
const SUBJECT_OPTIONS = ['Computer Science', 'Mathematics', 'Software Eng.', 'Personal', 'General'];

// ── Main Screen ───────────────────────────────────────────────
export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newSubject, setNewSubject] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const pendingCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  const toggleTask = (id) => {
    let completedItem = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, done: !t.done };
          if (updated.done) completedItem = updated;
          return updated;
        }
        return t;
      })
    );

    if (completedItem) {
      const userPhone = user?.profile?.phone_number || '+91 Mobile';
      NotificationService.notifyPhone({
        title: `✓ Task Completed: ${completedItem.title}`,
        body: `Great progress! Task marked done in your study tracker.`,
        type: 'task',
        phoneNumber: userPhone,
        showAlert: false, // silent feedback with vibration
      });
    }
  };

  const deleteTask = (id, title) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks((prev) => prev.filter((t) => t.id !== id)),
        },
      ]
    );
  };

  const clearCompleted = () => {
    if (completedCount === 0) return;
    Alert.alert(
      'Clear Completed',
      'Remove all completed tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setTasks((prev) => prev.filter((t) => !t.done)),
        },
      ]
    );
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const taskTitle = newTitle.trim();
    const taskPriority = newPriority;
    const taskSubject = newSubject;

    const newTask = {
      id: String(Date.now()),
      title: taskTitle,
      due: 'Today, 11:59 PM',
      priority: taskPriority,
      subject: taskSubject,
      done: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewPriority('medium');
    setNewSubject('General');
    setShowAdd(false);

    // Dispatch Phone Notification with Vibration and Alert
    const userPhone = user?.profile?.phone_number || '+91 Mobile';
    await NotificationService.notifyPhone({
      title: `📋 New Task: ${taskTitle}`,
      body: `Priority: ${taskPriority.toUpperCase()} · Subject: ${taskSubject}. Added to your schedule and synced to phone alerts.`,
      type: 'task',
      phoneNumber: userPhone,
      showAlert: true,
    });
  };

  // Filtered & Searched Tasks
  const displayedItems = useMemo(() => {
    let result = tasks;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
      );
    }

    // Filter chip
    if (activeFilter === 'Pending') {
      result = result.filter((t) => !t.done);
    } else if (activeFilter === 'Completed') {
      result = result.filter((t) => t.done);
    } else if (activeFilter === 'High Priority') {
      result = result.filter((t) => t.priority === 'high');
    }

    const pending = result.filter((t) => !t.done);
    const completed = result.filter((t) => t.done);

    const list = [];
    if (pending.length > 0) {
      list.push({ type: 'header', label: `PENDING (${pending.length})`, key: 'h-pending' });
      list.push(...pending.map((t) => ({ type: 'task', ...t })));
    }
    if (completed.length > 0) {
      list.push({
        type: 'header',
        label: `COMPLETED (${completed.length})`,
        key: 'h-completed',
        canClear: true,
      });
      list.push(...completed.map((t) => ({ type: 'task', ...t })));
    }

    return list;
  }, [tasks, searchQuery, activeFilter]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.heading}>Smart Tasks</Text>
          <Text style={styles.subheading}>
            {pendingCount} pending · {completedCount} completed
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks or subjects..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === f && styles.filterChipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Task inline card */}
      {showAdd && (
        <View style={styles.addCard}>
          <TextInput
            style={styles.addInput}
            placeholder="What needs to be done?"
            placeholderTextColor="#94A3B8"
            value={newTitle}
            onChangeText={setNewTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={addTask}
          />

          {/* Priority selector */}
          <Text style={styles.addOptionLabel}>Priority</Text>
          <View style={styles.optionsRow}>
            {['low', 'medium', 'high'].map((p) => {
              const isSelected = newPriority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionChip,
                    isSelected && { backgroundColor: PRIORITY_COLORS[p] + '20', borderColor: PRIORITY_COLORS[p] },
                  ]}
                  onPress={() => setNewPriority(p)}
                >
                  <View style={[styles.priorityDotSmall, { backgroundColor: PRIORITY_COLORS[p] }]} />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && { color: PRIORITY_COLORS[p], fontWeight: '700' },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Subject selector */}
          <Text style={styles.addOptionLabel}>Subject</Text>
          <View style={styles.optionsRow}>
            {SUBJECT_OPTIONS.map((sub) => {
              const isSelected = newSubject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[
                    styles.optionChip,
                    isSelected && { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary },
                  ]}
                  onPress={() => setNewSubject(sub)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && { color: COLORS.primary, fontWeight: '700' },
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.addActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAdd(false);
                setNewTitle('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={addTask}>
              <Text style={styles.saveText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.key || item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Try adjusting your search query' : 'All clear! Tap + to add a new task.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>{item.label}</Text>
                {item.canClear && (
                  <TouchableOpacity onPress={clearCompleted}>
                    <Text style={styles.clearBtnText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>
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
              <View style={styles.taskRightActions}>
                {!item.done && (
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: PRIORITY_COLORS[item.priority] + '18' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityBadgeText,
                        { color: PRIORITY_COLORS[item.priority] },
                      ]}
                    >
                      {item.priority.toUpperCase()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteTask(item.id, item.title)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
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
    paddingBottom: SPACING.sm,
  },
  heading: { fontSize: FONT.xl, fontWeight: '800', color: '#0F172A' },
  subheading: { fontSize: FONT.sm, color: '#64748B', marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: FONT.sm,
    color: '#0F172A',
    marginLeft: SPACING.xs,
    paddingVertical: 2,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  addCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addInput: {
    fontSize: FONT.md,
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: SPACING.sm,
  },
  addOptionLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#64748B',
    marginTop: SPACING.sm,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionChipText: {
    fontSize: FONT.xs,
    color: '#475569',
  },
  priorityDotSmall: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  cancelText: { color: '#64748B', fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  saveText: { color: '#FFFFFF', fontWeight: '700' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  clearBtnText: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: '#DC2626',
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  taskDone: { opacity: 0.6 },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: FONT.md, color: '#0F172A', fontWeight: '600' },
  taskStrike: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskMeta: { flexDirection: 'row', gap: SPACING.md, marginTop: 4 },
  taskSubject: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  taskDue: { fontSize: FONT.sm, color: '#94A3B8' },

  taskRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
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
  },
});
