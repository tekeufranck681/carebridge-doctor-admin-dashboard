// src/services/eventService.js
import api from "../config/axiosConfigEvents";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const eventService = {
  // Get all events (admin only)
  getAllEvents: async () => {
    try {
      const response = await api.get("/");
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch events");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Fetching events failed");
    }
  },

  // Delete events older than specified days (admin only)
  deleteEventsOlderThan: async (days) => {
    try {
      const response = await api.post("/delete-older-than", null, {
        params: { days }
      });
      if (response.data.status !== "success") {
        throw new Error("Failed to delete old events");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Deleting old events failed");
    }
  },

  // Delete event by ID (admin only)
  deleteEventById: async (eventId) => {
    try {
      const response = await api.delete(`/${eventId}`);
      if (response.data.status !== "success") {
        throw new Error("Failed to delete event");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Deleting event failed");
    }
  },
};