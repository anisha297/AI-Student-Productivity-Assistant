import client from '../api/client';

/**
 * Service to manage student calendar events and deadlines via Django REST API.
 */
export const EventService = {
  /**
   * Fetch events with optional filtering:
   * @param {Object} params - { date, start_date, end_date, month, agenda, category }
   */
  async getEvents(params = {}) {
    try {
      const response = await client.get('/events/', { params });
      return {
        success: true,
        events: response.data.events || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to load events.',
        events: [],
      };
    }
  },

  /**
   * Create a new calendar event
   * @param {Object} eventData - { title, date, start_time, end_time, category, location, description, priority }
   */
  async createEvent(eventData) {
    try {
      const response = await client.post('/events/', eventData);
      return {
        success: true,
        event: response.data.event,
        message: response.data.message || 'Event created successfully.',
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.end_time?.[0] ||
        error.response?.data?.errors?.title?.[0] ||
        error.response?.data?.errors?.date?.[0] ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create event.';
      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Update an existing event
   * @param {number|string} id
   * @param {Object} eventData
   */
  async updateEvent(id, eventData) {
    try {
      const response = await client.patch(`/events/${id}/`, eventData);
      return {
        success: true,
        event: response.data.event,
        message: response.data.message || 'Event updated successfully.',
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.end_time?.[0] ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update event.';
      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Delete an existing event
   * @param {number|string} id
   */
  async deleteEvent(id) {
    try {
      const response = await client.delete(`/events/${id}/`);
      return {
        success: true,
        message: response.data.message || 'Event deleted successfully.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete event.',
      };
    }
  },
};

export default EventService;
