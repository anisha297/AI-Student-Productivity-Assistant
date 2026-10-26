import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Vibration,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT, RADIUS } from '../constants/theme';
import SecureStorageService from '../services/secureStore';

const STORAGE_KEY_FLASHCARDS = 'student_flashcards_deck_v1';
const STORAGE_KEY_NOTES = 'student_quick_notes_v1';

// ── Default Seed Flashcards ────────────────────────────────────
const DEFAULT_FLASHCARDS = [
  {
    id: 'f1',
    subject: 'Data Structures',
    front: 'What is the average and worst-case time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
    back: 'Average: O(log n)\nWorst-case: O(log n)\n\nSelf-balancing keeps tree height strictly logarithmic, preventing degradation to O(n).',
    tip: '💡 Tip: Unbalanced BSTs can degenerate into a linked list with O(n) search.',
    mastered: true,
  },
  {
    id: 'f2',
    subject: 'Data Structures',
    front: 'Explain the difference between a Stack and a Queue.',
    back: 'Stack: LIFO (Last In, First Out). Elements are pushed and popped from the top.\n\nQueue: FIFO (First In, First Out). Elements are enqueued at rear and dequeued from front.',
    tip: '💡 Example: Stack = Browser Back button; Queue = Printer spooler.',
    mastered: false,
  },
  {
    id: 'f3',
    subject: 'Calculus & Math',
    front: 'What is the Fundamental Theorem of Calculus?',
    back: 'It links differentiation and integration: If f is continuous on [a, b] and F is an antiderivative of f, then:\n\n∫[a to b] f(x) dx = F(b) - F(a)',
    tip: '💡 Part 1: Integration undoes differentiation. Part 2: Enables exact definite integrals.',
    mastered: true,
  },
  {
    id: 'f4',
    subject: 'Calculus & Math',
    front: 'What is the derivative of f(x) = ln(x) and f(x) = e^(kx)?',
    back: 'd/dx [ln(x)] = 1/x (for x > 0)\n\nd/dx [e^(kx)] = k · e^(kx) (via chain rule)',
    tip: '💡 Quick test: If k = 1, d/dx [e^x] = e^x.',
    mastered: false,
  },
  {
    id: 'f5',
    subject: 'Software Eng.',
    front: 'What does the SOLID acronym stand for in Object-Oriented Design?',
    back: 'S: Single Responsibility\nO: Open/Closed (open for extension, closed for modification)\nL: Liskov Substitution\nI: Interface Segregation\nD: Dependency Inversion',
    tip: '💡 Core Goal: Maintainable, loosely coupled, and testable codebase.',
    mastered: false,
  },
  {
    id: 'f6',
    subject: 'Software Eng.',
    front: 'What is the difference between Agile and Waterfall methodology?',
    back: 'Waterfall: Sequential, plan-driven, distinct linear phases (requirements -> design -> code -> test).\n\nAgile: Iterative, incremental sprints (1-3 weeks), continuous customer feedback and adaptability.',
    tip: '💡 Waterfall works when requirements are immutable. Agile is best for evolving software.',
    mastered: true,
  },
  {
    id: 'f7',
    subject: 'Physics',
    front: 'State Ohm’s Law and its primary mathematical formula.',
    back: 'V = I · R\n\nVoltage (Volts) = Current (Amperes) × Resistance (Ohms).\n\nThe current through a conductor between two points is directly proportional to voltage across the points.',
    tip: '💡 P = V · I = I² · R allows calculating electrical power.',
    mastered: false,
  },
];

// ── Default Seed Notes ─────────────────────────────────────────
const DEFAULT_NOTES = [
  {
    id: 'n1',
    title: 'Data Structures: Sorting Complexity Quick Reference',
    subject: 'Data Structures',
    body: '• QuickSort: Avg O(n log n), Worst O(n²) when pivot poorly chosen.\n• MergeSort: Guaranteed O(n log n), requires O(n) auxiliary memory.\n• HeapSort: Guaranteed O(n log n) in-place.\n• InsertionSort: O(n²) worst, but O(n) for nearly-sorted lists.',
    updatedAt: 'Today, 10:15 AM',
  },
  {
    id: 'n2',
    title: 'Calculus: Integration by Parts Checklist',
    subject: 'Calculus & Math',
    body: 'Formula: ∫ u dv = uv - ∫ v du\n\nUse LIATE rule to pick u:\nL: Logarithmic functions (ln x)\nI: Inverse trigonometric (arctan x)\nA: Algebraic functions (x², 3x)\nT: Trigonometric functions (sin x, cos x)\nE: Exponential functions (e^x)',
    updatedAt: 'Yesterday',
  },
  {
    id: 'n3',
    title: 'Software Eng: Design Patterns Cheat Sheet',
    subject: 'Software Eng.',
    body: '• Creational: Singleton, Factory Method, Builder.\n• Structural: Adapter, Decorator, Facade, Composite.\n• Behavioral: Observer (Pub/Sub), Strategy, Command, State.\n\nObserver pattern is key in frontend event-driven UIs.',
    updatedAt: '2 days ago',
  },
];

const SUBJECT_COLORS = {
  'Data Structures': '#4F46E5',
  'Calculus & Math': '#0891B2',
  'Software Eng.': '#7C3AED',
  'Physics': '#059669',
  'General': '#D97706',
};

export default function NotesAndFlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'notes'

  // ── Flashcards State ──────────────────────────────────────────
  const [flashcards, setFlashcards] = useState(DEFAULT_FLASHCARDS);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardModalVisible, setNewCardModalVisible] = useState(false);

  // New card form
  const [newSubject, setNewSubject] = useState('Data Structures');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTip, setNewTip] = useState('');

  // ── Notes State ───────────────────────────────────────────────
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [notesSearch, setNotesSearch] = useState('');
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Data Structures');
  const [noteBody, setNoteBody] = useState('');

  // Card Flip Animation Value
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Load saved data from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedCards = await SecureStorageService.getItem(STORAGE_KEY_FLASHCARDS);
        if (storedCards) {
          const parsed = JSON.parse(storedCards);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFlashcards(parsed);
          }
        }
        const storedNotes = await SecureStorageService.getItem(STORAGE_KEY_NOTES);
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotes(parsed);
          }
        }
      } catch (e) {
        // use defaults
      }
    })();
  }, []);

  // Save flashcards when changed
  const saveCards = async (updated) => {
    setFlashcards(updated);
    try {
      await SecureStorageService.setItem(STORAGE_KEY_FLASHCARDS, JSON.stringify(updated));
    } catch (_) {}
  };

  // Save notes when changed
  const saveNotesList = async (updated) => {
    setNotes(updated);
    try {
      await SecureStorageService.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    } catch (_) {}
  };

  // Filtered flashcards by subject
  const filteredCards = useMemo(() => {
    if (selectedSubject === 'All') return flashcards;
    return flashcards.filter((c) => c.subject === selectedSubject);
  }, [flashcards, selectedSubject]);

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  // Reset index when changing subject
  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  // Flip card with smooth animation
  const flipCard = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(25);
      } catch (_) {}
    }

    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setIsFlipped(false);
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setIsFlipped(true);
    }
  };

  // Flip Interpolations
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Next / Previous
  const goNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      flipAnim.setValue(0);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or finish
      setCurrentIndex(0);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      flipAnim.setValue(0);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Shuffle Deck
  const shuffleDeck = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 30, 60, 30]);
      } catch (_) {}
    }
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    saveCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  // Toggle Mastered status
  const toggleMastered = (cardId, e) => {
    e?.stopPropagation?.();
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(40);
      } catch (_) {}
    }

    const updated = flashcards.map((c) =>
      c.id === cardId ? { ...c, mastered: !c.mastered } : c
    );
    saveCards(updated);

    // Auto advance to next card after mastering
    setTimeout(() => {
      goNext();
    }, 300);
  };

  // Delete Card
  const handleDeleteCard = (cardId) => {
    Alert.alert('Delete Card', 'Are you sure you want to remove this flashcard?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = flashcards.filter((c) => c.id !== cardId);
          saveCards(updated);
          if (currentIndex >= updated.length && updated.length > 0) {
            setCurrentIndex(updated.length - 1);
          }
          setIsFlipped(false);
          flipAnim.setValue(0);
        },
      },
    ]);
  };

  // Add Flashcard Submit
  const handleAddCardSubmit = () => {
    if (!newFront.trim() || !newBack.trim()) {
      Alert.alert('Incomplete Card', 'Please fill in both the Question (Front) and Answer (Back).');
      return;
    }

    const newCard = {
      id: `card_${Date.now()}`,
      subject: newSubject,
      front: newFront.trim(),
      back: newBack.trim(),
      tip: newTip.trim() ? `💡 Tip: ${newTip.trim()}` : '',
      mastered: false,
    };

    const updated = [newCard, ...flashcards];
    saveCards(updated);
    setNewFront('');
    setNewBack('');
    setNewTip('');
    setNewCardModalVisible(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  // ── Notes Handlers ────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    if (!notesSearch.trim()) return notes;
    const q = notesSearch.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
    );
  }, [notes, notesSearch]);

  const handleOpenNoteModal = (note = null) => {
    if (note) {
      setEditingNoteId(note.id);
      setNoteTitle(note.title);
      setNoteSubject(note.subject);
      setNoteBody(note.body);
    } else {
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteSubject('Data Structures');
      setNoteBody('');
    }
    setNewNoteModalVisible(true);
  };

  const handleSaveNoteSubmit = () => {
    if (!noteTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a note title.');
      return;
    }

    if (editingNoteId) {
      const updated = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              title: noteTitle.trim(),
              subject: noteSubject,
              body: noteBody.trim(),
              updatedAt: 'Just now',
            }
          : n
      );
      saveNotesList(updated);
    } else {
      const newNote = {
        id: `note_${Date.now()}`,
        title: noteTitle.trim(),
        subject: noteSubject,
        body: noteBody.trim(),
        updatedAt: 'Just now',
      };
      saveNotesList([newNote, ...notes]);
    }
    setNewNoteModalVisible(false);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this study note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          saveNotesList(notes.filter((n) => n.id !== noteId));
        },
      },
    ]);
  };

  // Convert Note into a Flashcard
  const handleConvertNoteToFlashcard = (note) => {
    const newCard = {
      id: `card_${Date.now()}`,
      subject: note.subject,
      front: `Key Concept: ${note.title}`,
      back: note.body || 'Review core notes for full details.',
      tip: `💡 From note: ${note.title}`,
      mastered: false,
    };
    saveCards([newCard, ...flashcards]);
    Alert.alert(
      'Flashcard Created! 📇',
      `"${note.title}" has been converted into a study flashcard in ${note.subject}.`,
      [
        { text: 'Keep Reading' },
        {
          text: 'Practice Now',
          onPress: () => {
            setActiveTab('flashcards');
            setSelectedSubject('All');
            setCurrentIndex(0);
            setIsFlipped(false);
          },
        },
      ]
    );
  };

  // Stats calculation
  const totalInCurrentDeck = filteredCards.length;
  const masteredInCurrentDeck = filteredCards.filter((c) => c.mastered).length;
  const masteryPercent = totalInCurrentDeck > 0 ? Math.round((masteredInCurrentDeck / totalInCurrentDeck) * 100) : 0;

  const subjectsList = ['All', 'Data Structures', 'Calculus & Math', 'Software Eng.', 'Physics', 'General'];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* ── Top App Bar ──────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.heading}>Study Hub</Text>
          <Text style={styles.subheading}>Flashcards & Lecture Notes</Text>
        </View>

        {activeTab === 'flashcards' ? (
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setNewCardModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.headerAddText}>Card</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => handleOpenNoteModal()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.headerAddText}>Note</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Segment Tab Switcher ──────────────────────────────────── */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'flashcards' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('flashcards')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="cards-outline"
            size={18}
            color={activeTab === 'flashcards' ? '#4F46E5' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'flashcards' && styles.segmentTextActive]}>
            Smart Flashcards ({flashcards.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'notes' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('notes')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="notebook-outline"
            size={18}
            color={activeTab === 'notes' ? '#4F46E5' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'notes' && styles.segmentTextActive]}>
            Quick Notes ({notes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: SMART FLASHCARDS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'flashcards' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subject Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectPillsContainer}
          >
            {subjectsList.map((subj) => {
              const isSelected = selectedSubject === subj;
              const count = subj === 'All' ? flashcards.length : flashcards.filter((c) => c.subject === subj).length;
              return (
                <TouchableOpacity
                  key={subj}
                  style={[styles.subjectPill, isSelected && styles.subjectPillActive]}
                  onPress={() => handleSelectSubject(subj)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.subjectPillText, isSelected && styles.subjectPillTextActive]}>
                    {subj} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Mastery Progress Card */}
          <View style={styles.masteryCard}>
            <View style={styles.masteryHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="trophy-outline" size={18} color="#D97706" />
                <Text style={styles.masteryTitle}>Deck Mastery Progress</Text>
              </View>
              <Text style={styles.masteryPercent}>{masteryPercent}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${masteryPercent}%` }]} />
            </View>

            <View style={styles.masteryFooter}>
              <Text style={styles.masteryStats}>
                {masteredInCurrentDeck} of {totalInCurrentDeck} mastered
              </Text>
              <TouchableOpacity
                style={styles.shuffleBtn}
                onPress={shuffleDeck}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="shuffle-variant" size={14} color="#4F46E5" />
                <Text style={styles.shuffleText}>Shuffle Deck</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interactive Flashcard */}
          {filteredCards.length > 0 && activeCard ? (
            <View style={styles.cardSection}>
              {/* Card Index & Badge */}
              <View style={styles.cardMetaRow}>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexBadgeText}>
                    CARD {currentIndex + 1} OF {totalInCurrentDeck}
                  </Text>
                </View>

                <View style={styles.cardRightActions}>
                  {activeCard.mastered && (
                    <View style={styles.masteredTag}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#059669" />
                      <Text style={styles.masteredTagText}>Mastered</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleDeleteCard(activeCard.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* The Flip Card Container */}
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={flipCard}
                style={styles.flipCardContainer}
              >
                {/* Front Side */}
                <Animated.View
                  style={[
                    styles.cardSurface,
                    styles.cardFront,
                    {
                      transform: [{ rotateY: frontInterpolate }],
                      opacity: flipAnim.interpolate({
                        inputRange: [0, 89, 90, 180],
                        outputRange: [1, 1, 0, 0],
                      }),
                    },
                  ]}
                >
                  <View style={styles.cardHeaderArea}>
                    <View
                      style={[
                        styles.subjectBadge,
                        { backgroundColor: (SUBJECT_COLORS[activeCard.subject] || '#4F46E5') + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subjectBadgeText,
                          { color: SUBJECT_COLORS[activeCard.subject] || '#4F46E5' },
                        ]}
                      >
                        {activeCard.subject.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.sideIndicator}>QUESTION</Text>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.questionText}>{activeCard.front}</Text>
                  </View>

                  <View style={styles.cardPromptArea}>
                    <MaterialCommunityIcons name="gesture-tap" size={18} color="#6366F1" />
                    <Text style={styles.cardPromptText}>Tap to flip & reveal answer</Text>
                  </View>
                </Animated.View>

                {/* Back Side */}
                <Animated.View
                  style={[
                    styles.cardSurface,
                    styles.cardBack,
                    {
                      transform: [{ rotateY: backInterpolate }],
                      opacity: flipAnim.interpolate({
                        inputRange: [0, 90, 91, 180],
                        outputRange: [0, 0, 1, 1],
                      }),
                    },
                  ]}
                >
                  <View style={styles.cardHeaderArea}>
                    <View
                      style={[
                        styles.subjectBadge,
                        { backgroundColor: (SUBJECT_COLORS[activeCard.subject] || '#4F46E5') + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subjectBadgeText,
                          { color: SUBJECT_COLORS[activeCard.subject] || '#4F46E5' },
                        ]}
                      >
                        {activeCard.subject.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.sideIndicator, { color: '#059669' }]}>ANSWER</Text>
                  </View>

                  <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.cardBackBody}
                  >
                    <Text style={styles.answerText}>{activeCard.back}</Text>
                    {!!activeCard.tip && (
                      <View style={styles.tipBox}>
                        <Text style={styles.tipBoxText}>{activeCard.tip}</Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.cardPromptArea}>
                    <MaterialCommunityIcons name="rotate-3d-variant" size={18} color="#059669" />
                    <Text style={[styles.cardPromptText, { color: '#059669' }]}>
                      Tap to flip back to question
                    </Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {/* Study Action Response Buttons */}
              <View style={styles.responseButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.reviewBtn]}
                  onPress={goNext}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#D97706" />
                  <Text style={styles.reviewBtnText}>Need Review</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.masterBtn,
                    activeCard.mastered && styles.masterBtnActive,
                  ]}
                  onPress={(e) => toggleMastered(activeCard.id, e)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={activeCard.mastered ? 'check-decagram' : 'checkbox-marked-circle-outline'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.masterBtnText}>
                    {activeCard.mastered ? 'Mastered!' : 'Mark Mastered'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Carousel Next / Prev Controls */}
              <View style={styles.carouselNavRow}>
                <TouchableOpacity
                  style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                  onPress={goPrev}
                  disabled={currentIndex === 0}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={22}
                    color={currentIndex === 0 ? '#CBD5E1' : '#0F172A'}
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      currentIndex === 0 && { color: '#CBD5E1' },
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text style={styles.cardCounterText}>
                  {currentIndex + 1} / {totalInCurrentDeck}
                </Text>

                <TouchableOpacity style={styles.navBtn} onPress={goNext}>
                  <Text style={styles.navBtnText}>Next</Text>
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="cards-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No cards in this deck</Text>
              <Text style={styles.emptyStateSub}>
                Tap the "+ Card" button at the top to add your first study flashcard!
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setNewCardModalVisible(true)}
              >
                <Text style={styles.emptyAddBtnText}>Create Flashcard</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        /* ═══════════════════════════════════════════════════════════
            TAB 2: QUICK NOTES
           ═══════════════════════════════════════════════════════════ */
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={styles.searchBarWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search study notes & summaries..."
              placeholderTextColor="#94A3B8"
              value={notesSearch}
              onChangeText={setNotesSearch}
            />
            {!!notesSearch && (
              <TouchableOpacity onPress={() => setNotesSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.notesListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteCardHeader}>
                    <View
                      style={[
                        styles.subjectBadge,
                        { backgroundColor: (SUBJECT_COLORS[note.subject] || '#4F46E5') + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subjectBadgeText,
                          { color: SUBJECT_COLORS[note.subject] || '#4F46E5' },
                        ]}
                      >
                        {note.subject}
                      </Text>
                    </View>
                    <Text style={styles.noteDate}>{note.updatedAt}</Text>
                  </View>

                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteBody} numberOfLines={4}>
                    {note.body}
                  </Text>

                  {/* Note Card Footer Action Buttons */}
                  <View style={styles.noteFooter}>
                    <TouchableOpacity
                      style={styles.convertFlashcardBtn}
                      onPress={() => handleConvertNoteToFlashcard(note)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="cards-outline" size={15} color="#4F46E5" />
                      <Text style={styles.convertFlashcardText}>Convert to Flashcard</Text>
                    </TouchableOpacity>

                    <View style={styles.noteRightIcons}>
                      <TouchableOpacity
                        onPress={() => handleOpenNoteModal(note)}
                        style={styles.iconActionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note.id)}
                        style={styles.iconActionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="notebook-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No notes found</Text>
                <Text style={styles.emptyStateSub}>
                  {notesSearch
                    ? 'No notes match your search keywords.'
                    : 'Tap "+ Note" to capture your first lecture takeaway!'}
                </Text>
                {!notesSearch && (
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={() => handleOpenNoteModal()}
                  >
                    <Text style={styles.emptyAddBtnText}>Create New Note</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ADD NEW FLASHCARD
         ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={newCardModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNewCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>New Smart Flashcard</Text>
                <Text style={styles.modalSubtitle}>Create a high-yield study prompt</Text>
              </View>
              <TouchableOpacity onPress={() => setNewCardModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Subject Selector */}
              <Text style={styles.fieldLabel}>COURSE / SUBJECT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Data Structures', 'Calculus & Math', 'Software Eng.', 'Physics', 'General'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalSubjPill, newSubject === s && styles.modalSubjPillActive]}
                    onPress={() => setNewSubject(s)}
                  >
                    <Text
                      style={[
                        styles.modalSubjPillText,
                        newSubject === s && styles.modalSubjPillTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Front (Question) */}
              <Text style={styles.fieldLabel}>FRONT (QUESTION / PROMPT)</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 70 }]}
                placeholder="e.g. What is the time complexity of QuickSort?"
                placeholderTextColor="#94A3B8"
                multiline
                value={newFront}
                onChangeText={setNewFront}
              />

              {/* Back (Answer) */}
              <Text style={styles.fieldLabel}>BACK (ANSWER / EXPLANATION)</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 90 }]}
                placeholder="e.g. Average: O(n log n), Worst-case: O(n²)"
                placeholderTextColor="#94A3B8"
                multiline
                value={newBack}
                onChangeText={setNewBack}
              />

              {/* Mnemonic / Tip */}
              <Text style={styles.fieldLabel}>PRO TIP / MNEMONIC (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Remember: Pivot choice determines performance"
                placeholderTextColor="#94A3B8"
                value={newTip}
                onChangeText={setNewTip}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleAddCardSubmit}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Save to Flashcards</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ADD / EDIT NOTE
         ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={newNoteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNewNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingNoteId ? 'Edit Study Note' : 'Create Study Note'}
                </Text>
                <Text style={styles.modalSubtitle}>Jot down key lecture takeaways</Text>
              </View>
              <TouchableOpacity onPress={() => setNewNoteModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Subject Selector */}
              <Text style={styles.fieldLabel}>COURSE / SUBJECT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Data Structures', 'Calculus & Math', 'Software Eng.', 'Physics', 'General'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalSubjPill, noteSubject === s && styles.modalSubjPillActive]}
                    onPress={() => setNoteSubject(s)}
                  >
                    <Text
                      style={[
                        styles.modalSubjPillText,
                        noteSubject === s && styles.modalSubjPillTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text style={styles.fieldLabel}>NOTE TITLE</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Big-O Complexity Cheatsheet"
                placeholderTextColor="#94A3B8"
                value={noteTitle}
                onChangeText={setNoteTitle}
              />

              {/* Body */}
              <Text style={styles.fieldLabel}>NOTE CONTENT (BULLETS / DETAILS)</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 140 }]}
                placeholder="Enter lecture summary, formulas, or key definitions..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={noteBody}
                onChangeText={setNoteBody}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveNoteSubmit}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  headerBtn: {
    padding: 4,
  },
  heading: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: '#0F172A',
  },
  subheading: {
    fontSize: FONT.xs,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  headerAddText: {
    color: '#FFFFFF',
    fontSize: FONT.xs,
    fontWeight: '700',
  },

  // Segment Tab Bar
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Subject Pills
  subjectPillsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    marginBottom: SPACING.md,
  },
  subjectPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  subjectPillText: {
    fontSize: FONT.xs,
    color: '#475569',
    fontWeight: '600',
  },
  subjectPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Mastery Progress Card
  masteryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  masteryTitle: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  masteryPercent: {
    fontSize: FONT.sm,
    fontWeight: '800',
    color: '#4F46E5',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: RADIUS.full,
  },
  masteryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masteryStats: {
    fontSize: FONT.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  shuffleText: {
    fontSize: FONT.xs,
    color: '#4F46E5',
    fontWeight: '700',
  },

  // Flashcard Area
  cardSection: {
    paddingHorizontal: SPACING.lg,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indexBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  indexBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  masteredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  masteredTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // 3D Flip Card
  flipCardContainer: {
    height: 310,
    width: '100%',
    marginBottom: SPACING.md,
  },
  cardSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  cardBack: {
    backgroundColor: '#FAFBFF',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  subjectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sideIndicator: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.8,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  questionText: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 28,
  },
  cardBackBody: {
    paddingVertical: SPACING.sm,
  },
  answerText: {
    fontSize: FONT.base,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  tipBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  tipBoxText: {
    fontSize: FONT.xs,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  cardPromptArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  cardPromptText: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: '#6366F1',
  },

  // Action Buttons
  responseButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  reviewBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewBtnText: {
    color: '#B45309',
    fontSize: FONT.sm,
    fontWeight: '700',
  },
  masterBtn: {
    backgroundColor: '#059669',
  },
  masterBtnActive: {
    backgroundColor: '#047857',
  },
  masterBtnText: {
    color: '#FFFFFF',
    fontSize: FONT.sm,
    fontWeight: '700',
  },

  // Carousel Navigation
  carouselNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardCounterText: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#64748B',
  },

  // Notes View
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT.sm,
    color: '#0F172A',
  },
  notesListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: FONT.xs,
    color: '#94A3B8',
  },
  noteTitle: {
    fontSize: FONT.base,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  noteBody: {
    fontSize: FONT.sm,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  convertFlashcardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  convertFlashcardText: {
    fontSize: FONT.xs,
    color: '#4F46E5',
    fontWeight: '700',
  },
  noteRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconActionBtn: {
    padding: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: FONT.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  emptyAddBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: FONT.sm,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
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
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  modalSubjPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  modalSubjPillActive: {
    backgroundColor: '#4F46E5',
  },
  modalSubjPillText: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: '#475569',
  },
  modalSubjPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.sm,
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: FONT.base,
    fontWeight: '700',
  },
});
