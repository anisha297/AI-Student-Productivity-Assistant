import { Alert, Vibration, Platform } from 'react-native';
import SecureStorageService from './secureStore';

const NOTIFICATIONS_STORAGE_KEY = 'user_notifications_history';

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'Assignment Due Tonight',       body: 'Data Structures Graph Traversal is due at 11:59 PM',    time: 'Just now',    type: 'deadline', read: false },
  { id: '2', title: 'Phishing Email Detected',      body: 'A suspicious email from fakebank.com was flagged',       time: '2 min ago',   type: 'security', read: false },
  { id: '3', title: 'Study Group Reminder',         body: 'CS Study Group starts in 30 minutes — Library Room 2A', time: '28 min ago',  type: 'event',    read: false },
  { id: '4', title: 'New Email from Prof. Johnson', body: 'Final Project Guidelines have been updated',             time: '1 hour ago',  type: 'email',    read: true  },
  { id: '5', title: 'Daily Briefing Ready',         body: 'Your AI briefing for today is ready to review',          time: '3 hours ago', type: 'ai',       read: true  },
  { id: '6', title: 'Task Completed',               body: 'Physics Lab Report was marked as done',                  time: 'Yesterday',   type: 'task',     read: true  },
];

// In-memory cache for fast updates
let memoryNotifications = [...INITIAL_NOTIFICATIONS];
let listeners = [];

export const NotificationService = {
  /**
   * Subscribe to notification updates across screens
   */
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn([...memoryNotifications]);
      } catch (e) {
        console.warn('Listener error', e);
      }
    });
  },

  /**
   * Get all notifications
   */
  async getNotifications() {
    try {
      const stored = await SecureStorageService.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        memoryNotifications = JSON.parse(stored);
      }
    } catch (e) {
      // fallback to memory
    }
    return [...memoryNotifications];
  },

  /**
   * Send notification to phone and add to app notifications
   * @param {Object} payload { title, body, type, phoneNumber, showAlert }
   */
  async notifyPhone({ title, body, type = 'task', phoneNumber, showAlert = true }) {
    // 1. Phone Vibration feedback
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(180);
      }
    } catch (e) {}

    // 2. Add to notification center
    const newNotif = {
      id: String(Date.now()),
      title,
      body,
      time: 'Just now',
      type,
      read: false,
      timestamp: Date.now(),
    };

    memoryNotifications = [newNotif, ...memoryNotifications];
    try {
      await SecureStorageService.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(memoryNotifications.slice(0, 30))
      );
    } catch (e) {}

    this.notifyListeners();

    // 3. Dispatch simulated SMS / Push Notification to Phone
    const targetPhone = phoneNumber || '+91 Mobile';

    if (showAlert) {
      Alert.alert(
        '📱 Notification Sent to Phone',
        `Dispatched to ${targetPhone}:\n\n"${title}: ${body}"`,
        [{ text: 'OK' }]
      );
    }

    return newNotif;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead() {
    memoryNotifications = memoryNotifications.map((n) => ({ ...n, read: true }));
    try {
      await SecureStorageService.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(memoryNotifications)
      );
    } catch (e) {}
    this.notifyListeners();
    return memoryNotifications;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    memoryNotifications = memoryNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    try {
      await SecureStorageService.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(memoryNotifications)
      );
    } catch (e) {}
    this.notifyListeners();
    return memoryNotifications;
  },
};

export default NotificationService;
