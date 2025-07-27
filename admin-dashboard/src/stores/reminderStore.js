// src/stores/reminderStore.js
import { create } from "zustand";
import { reminderService } from "../services/reminderService";

export const useReminderStore = create((set) => ({
  reminders: [],
  selectedReminder: null,
  isReminderLoading: false,
  error: null,

  createReminder: async (reminderData) => {
    set({ isReminderLoading: true, error: null });
    try {
    console.log("Creating reminder with data:", reminderData);
      const reminder = await reminderService.createReminder(reminderData);
      set((state) => ({
        reminders: [...state.reminders, reminder],
        isReminderLoading: false,
      }));
      return reminder;
    } catch (error) {
      set({ isReminderLoading: false, error: error.message });
      throw error;
    }
  },

  fetchReminders: async () => {
    set({ isReminderLoading: true, error: null });
    try {
      const reminders = await reminderService.getReminders();
      set({ reminders, isReminderLoading: false });
      return reminders;
    } catch (error) {
      set({ isReminderLoading: false, error: error.message });
      throw error;
    }
  },

  fetchReminderById: async (reminderId) => {
    set({ isReminderLoading: true, error: null });
    try {
      const reminder = await reminderService.getReminderById(reminderId);
      set({ selectedReminder: reminder, isReminderLoading: false });
      return reminder;
    } catch (error) {
      set({ isReminderLoading: false, error: error.message });
      throw error;
    }
  },

  updateReminder: async (reminderId, updatedData) => {
    set({ isReminderLoading: true, error: null });
    try {
      const updatedReminder = await reminderService.updateReminder(
        reminderId,
        updatedData
      );
      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.id === reminderId ? updatedReminder : reminder
        ),
        isReminderLoading: false,
      }));
      return updatedReminder;
    } catch (error) {
      set({ isReminderLoading: false, error: error.message });
      throw error;
    }
  },

  deleteReminder: async (reminderId) => {
    set({ isReminderLoading: true, error: null });
    try {
      await reminderService.deleteReminder(reminderId);
      set((state) => ({
        reminders: state.reminders.filter(
          (reminder) => reminder.id !== reminderId
        ),
        isReminderLoading: false,
      }));
    } catch (error) {
      set({ isReminderLoading: false, error: error.message });
      throw error;
    }
  },

  selectReminder: (reminder) => set({ selectedReminder: reminder }),

  clearError: () => set({ error: null }),
}));