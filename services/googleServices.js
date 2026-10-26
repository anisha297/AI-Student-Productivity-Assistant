import client from '../api/client';

/**
 * Service to retrieve connected student Google services data via Django backend.
 */
export const GoogleServices = {
  /**
   * Check whether the authenticated user has a connected Google account and permissions.
   */
  async getConnectionStatus() {
    try {
      const response = await client.get('/auth/google/status/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: error.response?.data?.message || 'Failed to check Google connection status.',
      };
    }
  },

  /**
   * Disconnect the student's connected Google account.
   */
  async disconnectGoogleAccount() {
    try {
      const response = await client.delete('/auth/google/disconnect/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disconnect Google account.',
      };
    }
  },

  /**
   * Retrieve student's Gmail messages:
   * - Email ID
   * - Sender
   * - Subject
   * - Date
   * - Snippet/content
   * - Labels
   */
  async getGmailMessages(maxResults = 15) {
    try {
      const response = await client.get('/auth/google/gmail/', {
        params: { max_results: maxResults },
      });
      return {
        success: true,
        emails: response.data.emails || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve Gmail messages.',
        emails: [],
      };
    }
  },

  /**
   * Retrieve student's Google Classroom information:
   * - Course name
   * - Course ID
   * - Assignments/coursework
   * - Due dates
   * - Relevant submission information
   */
  async getClassroomCourses() {
    try {
      const response = await client.get('/auth/google/classroom/');
      return {
        success: true,
        courses: response.data.courses || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve Classroom courses.',
        courses: [],
      };
    }
  },

  /**
   * Retrieve student's Google Calendar information:
   * - Event title
   * - Start time
   * - End time
   * - Description/location
   */
  async getCalendarEvents(maxResults = 20) {
    try {
      const response = await client.get('/auth/google/calendar/', {
        params: { max_results: maxResults },
      });
      return {
        success: true,
        events: response.data.events || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve Calendar events.',
        events: [],
      };
    }
  },
};

export default GoogleServices;
