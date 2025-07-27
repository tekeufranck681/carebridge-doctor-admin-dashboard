// src/services/reminderService.js
import api from "../config/axiosConfigReminders";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const reminderService = {
  createReminder: async (reminderData) => {
    try {
      
      const response = await api.post("/", reminderData);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to create reminder");
    }
  },

  getReminders: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch reminders");
    }
  },

  getReminderById: async (reminderId) => {
    try {
      const response = await api.get(`/${reminderId}`);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch reminder");
    }
  },

  updateReminder: async (reminderId, updatedData) => {
    try {
      const response = await api.put(`/${reminderId}`, updatedData);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to update reminder");
    }
  },

  deleteReminder: async (reminderId) => {
    try {
      const response = await api.delete(`/${reminderId}`);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to delete reminder");
    }
  },
};