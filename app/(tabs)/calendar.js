import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS } from '../../constants/theme';
import EventService from '../../services/eventService';

// ── Category Configuration ─────────────────────────────────────
const CATEGORIES = [
  { key: 'study', label: 'Study Session', icon: 'book-open-outline', color: '#7C3AED' },
  { key: 'assignment', label: 'Assignment / Deadline', icon: 'clock-alert-outline', color: '#DC2626' },
  { key: 'exam', label: 'Exam / Quiz', icon: 'pencil-outline', color: '#D97706' },
  { key: 'meeting', label: 'Meeting', icon: 'video-outline', color: '#0284C7' },
  { key: 'task', label: 'Task', icon: 'checkbox-marked-circle-outline', color: '#059669' },
];

const PRIORITIES = [
  { key: 'low', label: 'Low', color: '#059669' },
  { key: 'medium', label: 'Medium', color: '#D97706' },
  { key: 'high', label: 'High', color: '#DC2626' },
];

const AGENDA_TABS = [
  { key: 'selected', label: 'Date' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'upcoming', label: 'Next 7 Days' },
  { key: 'overdue', label: 'Overdue' },
];

// ── Date Formatting Helpers ───────────────────────────────────
function formatISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatInputTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5); // HH:MM
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const todayDateObj = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatISODate(new Date()), []);

  // Selected date & current view state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('selected');

  // Events data
  const [events, setEvents] = useState([]);
  const [monthEventDates, setMonthEventDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formCategory, setFormCategory] = useState('study');
  const [formPriority, setFormPriority] = useState('medium');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  // ── Month Days Calculation ──────────────────────────────────
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const iso = formatISODate(d);
      days.push({
        iso,
        dayNum,
        dayName: DAY_ABBR[d.getDay()],
        isToday: iso === todayStr,
      });
    }
    return days;
  }, [currentMonthDate, todayStr]);

  // ── Month Navigation ────────────────────────────────────────
  const changeMonth = (direction) => {
    setCurrentMonthDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      return nextDate;
    });
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDate(todayStr);
    setActiveTab('today');
  };

  // ── Fetch Events ────────────────────────────────────────────
  const loadEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch all user events to calculate month dots and current view
      const res = await EventService.getEvents();

      if (res.success) {
        setEvents(res.events || []);

        // Populate dates that have events
        const datesSet = new Set((res.events || []).map((ev) => ev.date));
        setMonthEventDates(datesSet);
      } else {
        setErrorMessage(res.error || 'Failed to load events.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ── Filtered Events for Active Tab ──────────────────────────
  const displayedEvents = useMemo(() => {
    const now = new Date();
    const today = formatISODate(now);

    const tomorrowObj = new Date(now);
    tomorrowObj.setDate(now.getDate() + 1);
    const tomorrow = formatISODate(tomorrowObj);

    const nextWeekObj = new Date(now);
    nextWeekObj.setDate(now.getDate() + 7);
    const nextWeek = formatISODate(nextWeekObj);

    return events.filter((ev) => {
      if (activeTab === 'selected') {
        return ev.date === selectedDate;
      }
      if (activeTab === 'today') {
        return ev.date === today;
      }
      if (activeTab === 'tomorrow') {
        return ev.date === tomorrow;
      }
      if (activeTab === 'upcoming') {
        return ev.date >= today && ev.date <= nextWeek;
      }
      if (activeTab === 'overdue') {
        return ev.date < today && !ev.is_completed;
      }
      return true;
    });
  }, [events, activeTab, selectedDate]);

  // ── Counts for Agenda Tabs ──────────────────────────────────
  const tabCounts = useMemo(() => {
    const now = new Date();
    const today = formatISODate(now);

    const tomorrowObj = new Date(now);
    tomorrowObj.setDate(now.getDate() + 1);
    const tomorrow = formatISODate(tomorrowObj);

    const nextWeekObj = new Date(now);
    nextWeekObj.setDate(now.getDate() + 7);
    const nextWeek = formatISODate(nextWeekObj);

    let selectedCount = 0;
    let todayCount = 0;
    let tomorrowCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;

    events.forEach((ev) => {
      if (ev.date === selectedDate) selectedCount++;
      if (ev.date === today) todayCount++;
      if (ev.date === tomorrow) tomorrowCount++;
      if (ev.date >= today && ev.date <= nextWeek) upcomingCount++;
      if (ev.date < today && !ev.is_completed) overdueCount++;
    });

    return {
      selected: selectedCount,
      today: todayCount,
      tomorrow: tomorrowCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    };
  }, [events, selectedDate]);

  // ── Modal Actions (Open Create / Edit) ──────────────────────
  const openCreateModal = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDate(selectedDate || todayStr);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormCategory('study');
    setFormPriority('medium');
    setFormLocation('');
    setFormDescription('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (event) => {
    setEditingEventId(event.id);
    setFormTitle(event.title || '');
    setFormDate(event.date || todayStr);
    setFormStartTime(formatInputTime(event.start_time) || '09:00');
    setFormEndTime(formatInputTime(event.end_time) || '10:00');
    setFormCategory(event.category || 'study');
    setFormPriority(event.priority || 'medium');
    setFormLocation(event.location || '');
    setFormDescription(event.description || '');
    setFormError('');
    setModalVisible(true);
  };

  // ── Save / Update Event ─────────────────────────────────────
  const handleSaveEvent = async () => {
    if (!formTitle.trim()) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!formDate.trim()) {
      setFormError('Please specify an event date (YYYY-MM-DD).');
      return;
    }

    // Validate times if provided
    if (formStartTime && formEndTime && formStartTime >= formEndTime) {
      setFormError('End time must be after start time.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      title: formTitle.trim(),
      date: formDate.trim(),
      start_time: formStartTime ? `${formStartTime}:00` : null,
      end_time: formEndTime ? `${formEndTime}:00` : null,
      category: formCategory,
      priority: formPriority,
      location: formLocation.trim(),
      description: formDescription.trim(),
    };

    if (editingEventId) {
      const res = await EventService.updateEvent(editingEventId, payload);
      setSaving(false);
      if (res.success) {
        setEvents((prev) =>
          prev.map((item) => (item.id === editingEventId ? res.event : item))
        );
        setMonthEventDates((prev) => new Set([...prev, payload.date]));
        setModalVisible(false);
      } else {
        setFormError(res.error);
      }
    } else {
      const res = await EventService.createEvent(payload);
      setSaving(false);
      if (res.success) {
        setEvents((prev) => [res.event, ...prev]);
        setMonthEventDates((prev) => new Set([...prev, payload.date]));
        setSelectedDate(payload.date);
        setModalVisible(false);
      } else {
        setFormError(res.error);
      }
    }
  };

  // ── Toggle Event Complete ───────────────────────────────────
  const handleToggleComplete = async (event) => {
    const updatedStatus = !event.is_completed;
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, is_completed: updatedStatus } : ev))
    );

    const res = await EventService.updateEvent(event.id, { is_completed: updatedStatus });
    if (!res.success) {
      // Revert if failed
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, is_completed: !updatedStatus } : ev))
      );
      Alert.alert('Error', 'Failed to update event status.');
    }
  };

  // ── Delete Event ────────────────────────────────────────────
  const handleDeleteEvent = (event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            const prevEvents = [...events];
            setEvents((prev) => prev.filter((ev) => ev.id !== event.id));

            const res = await EventService.deleteEvent(event.id);
            if (!res.success) {
              setEvents(prevEvents);
              Alert.alert('Error', res.error || 'Failed to delete event.');
            } else {
              // Recompute dots
              setMonthEventDates((prev) => {
                const updated = new Set();
                prevEvents
                  .filter((ev) => ev.id !== event.id)
                  .forEach((ev) => updated.add(ev.date));
                return updated;
              });
            }
          },
        },
      ]
    );
  };

  const monthLabel = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.heading}>Calendar</Text>
          <Text style={styles.subHeading}>Organize studies, deadlines &amp; schedule</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateModal}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigator Header */}
      <View style={styles.monthNavRow}>
        <View style={styles.monthTitleWrapper}>
          <Text style={styles.monthTitleText}>{monthLabel}</Text>
          <TouchableOpacity onPress={jumpToToday} style={styles.todayPill} activeOpacity={0.7}>
            <Text style={styles.todayPillText}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navControls}>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={() => changeMonth(-1)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={() => changeMonth(1)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Month Strip */}
      <View style={styles.stripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripScroll}
        >
          {calendarDays.map((d) => {
            const isSelected = selectedDate === d.iso;
            const hasEvent = monthEventDates.has(d.iso);

            return (
              <TouchableOpacity
                key={d.iso}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardActive,
                  d.isToday && !isSelected && styles.dayCardToday,
                ]}
                onPress={() => {
                  setSelectedDate(d.iso);
                  setActiveTab('selected');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dayNameText,
                    isSelected && styles.dayTextActive,
                    d.isToday && !isSelected && styles.dayNameToday,
                  ]}
                >
                  {d.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumText,
                    isSelected && styles.dayTextActive,
                    d.isToday && !isSelected && styles.dayNumToday,
                  ]}
                >
                  {d.dayNum}
                </Text>

                {/* Event Indicator Dot */}
                <View style={styles.dotContainer}>
                  {hasEvent ? (
                    <View
                      style={[
                        styles.eventDot,
                        isSelected && { backgroundColor: '#FFFFFF' },
                      ]}
                    />
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Agenda Tabs */}
      <View style={styles.agendaTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agendaTabsScroll}>
          {AGENDA_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key] || 0;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.agendaTab, isActive && styles.agendaTabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.agendaTabText, isActive && styles.agendaTabTextActive]}>
                  {tab.key === 'selected'
                    ? parseISODate(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                    : tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading calendar events...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorHeading}>Unable to load events</Text>
          <Text style={styles.errorMessageText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadEvents()} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.eventsScroll}
          contentContainerStyle={styles.eventsScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadEvents(true)} colors={[COLORS.primary]} />
          }
        >
          {displayedEvents.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No events scheduled</Text>
              <Text style={styles.emptyStateSubtitle}>
                {activeTab === 'selected'
                  ? `There are no events or deadlines for ${selectedDate}.`
                  : activeTab === 'overdue'
                  ? 'Great job! You have no overdue assignments or tasks.'
                  : 'No upcoming items found for this view.'}
              </Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={openCreateModal} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.emptyAddButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayedEvents.map((item) => {
              const catConfig = CATEGORIES.find((c) => c.key === item.category) || CATEGORIES[0];
              const priConfig = PRIORITIES.find((p) => p.key === item.priority) || PRIORITIES[1];

              const timeRange = item.start_time
                ? `${formatTimeDisplay(item.start_time)}${
                    item.end_time ? ' - ' + formatTimeDisplay(item.end_time) : ''
                  }`
                : 'All Day';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.eventCard,
                    item.is_completed && styles.eventCardCompleted,
                  ]}
                >
                  {/* Category Accent Bar */}
                  <View style={[styles.cardAccentBar, { backgroundColor: catConfig.color }]} />

                  {/* Complete Checkbox Toggle */}
                  <TouchableOpacity
                    style={styles.completeToggle}
                    onPress={() => handleToggleComplete(item)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={item.is_completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={24}
                      color={item.is_completed ? COLORS.success : '#94A3B8'}
                    />
                  </TouchableOpacity>

                  {/* Event Details */}
                  <View style={styles.cardDetails}>
                    <View style={styles.cardHeaderRow}>
                      <Text
                        style={[
                          styles.cardTitle,
                          item.is_completed && styles.cardTitleCompleted,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </View>

                    {/* Meta Row: Time & Date */}
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                      <Text style={styles.metaText}>{timeRange}</Text>
                      {activeTab !== 'selected' && (
                        <>
                          <Text style={styles.metaDot}>•</Text>
                          <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#64748B" />
                          <Text style={styles.metaText}>{item.date}</Text>
                        </>
                      )}
                    </View>

                    {/* Location */}
                    {!!item.location && (
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                      </View>
                    )}

                    {/* Description */}
                    {!!item.description && (
                      <Text style={styles.descriptionText} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}

                    {/* Badges: Category & Priority */}
                    <View style={styles.badgeRow}>
                      <View style={[styles.pillBadge, { backgroundColor: catConfig.color + '15' }]}>
                        <MaterialCommunityIcons name={catConfig.icon} size={12} color={catConfig.color} />
                        <Text style={[styles.pillBadgeText, { color: catConfig.color }]}>
                          {catConfig.label}
                        </Text>
                      </View>

                      <View style={[styles.pillBadge, { backgroundColor: priConfig.color + '15' }]}>
                        <Text style={[styles.pillBadgeText, { color: priConfig.color }]}>
                          {priConfig.label} Priority
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions: Edit & Delete */}
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => openEditModal(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleDeleteEvent(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── Add / Edit Event Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingEventId ? 'Edit Event' : 'Create New Event'}
                </Text>
                <Text style={styles.modalSubtitle}>Fill in schedule details below</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalFormContent}
            >
              {/* Form Validation Error Banner */}
              {!!formError && (
                <View style={styles.formErrorBanner}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              )}

              {/* Title */}
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Computer Networks Midterm Exam"
                placeholderTextColor="#94A3B8"
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Date */}
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={formDate}
                onChangeText={setFormDate}
              />

              {/* Start & End Times */}
              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start Time (HH:MM)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="09:00"
                    placeholderTextColor="#94A3B8"
                    value={formStartTime}
                    onChangeText={setFormStartTime}
                  />
                </View>
                <View style={{ width: SPACING.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Time (HH:MM)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="10:00"
                    placeholderTextColor="#94A3B8"
                    value={formEndTime}
                    onChangeText={setFormEndTime}
                  />
                </View>
              </View>

              {/* Category Selection */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = formCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.catOption,
                        isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                      ]}
                      onPress={() => setFormCategory(cat.key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={14}
                        color={isSelected ? '#FFFFFF' : cat.color}
                      />
                      <Text
                        style={[
                          styles.catOptionText,
                          isSelected && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Priority Selection */}
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((pri) => {
                  const isSelected = formPriority === pri.key;
                  return (
                    <TouchableOpacity
                      key={pri.key}
                      style={[
                        styles.priorityOption,
                        isSelected && { backgroundColor: pri.color, borderColor: pri.color },
                      ]}
                      onPress={() => setFormPriority(pri.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          isSelected && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                      >
                        {pri.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Location */}
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Auditorium B or Google Meet"
                placeholderTextColor="#94A3B8"
                value={formLocation}
                onChangeText={setFormLocation}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Notes, topics covered, or submission link..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEvent}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingEventId ? 'Update Event' : 'Save Event'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Stylesheet ────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heading: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: '#0F172A',
  },
  subHeading: {
    fontSize: FONT.xs,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONT.sm,
    fontWeight: '700',
  },

  // Month Navigation
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  monthTitleText: {
    fontSize: FONT.base,
    fontWeight: '700',
    color: '#0F172A',
  },
  todayPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  todayPillText: {
    color: COLORS.primary,
    fontSize: FONT.xs,
    fontWeight: '700',
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navArrow: {
    padding: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
  },

  // Strip of Days
  stripContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stripScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs + 2,
  },
  dayCard: {
    width: 48,
    height: 72,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayCardToday: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  dayNameText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNameToday: {
    color: COLORS.primary,
  },
  dayNumText: {
    fontSize: FONT.base,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 2,
  },
  dayNumToday: {
    color: COLORS.primary,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dotContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  emptyDot: {
    width: 5,
    height: 5,
  },

  // Agenda Filter Tabs
  agendaTabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  agendaTabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs + 2,
  },
  agendaTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  agendaTabActive: {
    backgroundColor: '#0F172A',
  },
  agendaTabText: {
    fontSize: FONT.xs + 1,
    fontWeight: '600',
    color: '#475569',
  },
  agendaTabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  tabBadgeActive: {
    backgroundColor: '#334155',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // Event List Area
  eventsScroll: {
    flex: 1,
  },
  eventsScrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT.sm,
    color: '#64748B',
  },
  errorHeading: {
    fontSize: FONT.base,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: SPACING.sm,
  },
  errorMessageText: {
    fontSize: FONT.sm,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT.sm,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT.base + 1,
    fontWeight: '700',
    color: '#334155',
    marginTop: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONT.sm,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT.sm,
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  eventCardCompleted: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  completeToggle: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  cardDetails: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: FONT.base,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: FONT.xs + 1,
    color: '#64748B',
  },
  metaDot: {
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  descriptionText: {
    fontSize: FONT.xs + 1,
    color: '#475569',
    marginTop: 6,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionColumn: {
    marginLeft: SPACING.xs,
    gap: 4,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F8FAFC',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: FONT.lg,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: FONT.xs,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  modalFormContent: {
    padding: SPACING.lg,
  },
  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: 6,
  },
  formErrorText: {
    color: COLORS.danger,
    fontSize: FONT.xs,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT.sm,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  catOptionText: {
    fontSize: FONT.xs,
    color: '#334155',
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  priorityOptionText: {
    fontSize: FONT.xs,
    color: '#334155',
    fontWeight: '600',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: FONT.sm,
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT.sm,
  },
});
