// src/stores/eventStore.js
import { create } from "zustand";
import { eventService } from "../services/eventService";

export const useEventStore = create((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Fetch all events (admin only)
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventService.getAllEvents();
      set({ events, isLoading: false });
      return events;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete events older than specified days (admin only)
  deleteEventsOlderThan: async (days) => {
    set({ isLoading: true, error: null });
    try {
      const result = await eventService.deleteEventsOlderThan(days);
      // Refetch events to update the list
      const updatedEvents = await eventService.getAllEvents();
      set({ events: updatedEvents, isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete event by ID (admin only)
  deleteEventById: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await eventService.deleteEventById(eventId);
      set((state) => ({
        events: state.events.filter((event) => event.id !== eventId),
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Select an event for viewing details
  selectEvent: (event) => set({ selectedEvent: event }),

  // Clear all events (for UI purposes)
  clearAllEvents: () => set({ events: [] }),
}));