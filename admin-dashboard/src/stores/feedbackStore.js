// src/stores/feedbackStore.js
import { create } from "zustand";
import { feedbackService } from "../services/feedbackService";

export const useFeedbackStore = create((set) => ({
  feedbacks: [],
  selectedFeedback: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Fetch all feedbacks (admin only)
  fetchFeedbacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const feedbacks = await feedbackService.getAllFeedbacks();
      set({ feedbacks, isLoading: false });
      return feedbacks;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get a single feedback by ID (admin only)
  getFeedbackById: async (feedbackId) => {
    set({ isLoading: true, error: null });
    try {
      const feedback = await feedbackService.getFeedbackById(feedbackId);
      set({ selectedFeedback: feedback, isLoading: false });
      return feedback;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete a feedback (admin only)
  deleteFeedback: async (feedbackId) => {
    set({ isLoading: true, error: null });
    try {
      await feedbackService.deleteFeedback(feedbackId);
      set((state) => ({
        feedbacks: state.feedbacks.filter((f) => f.id !== feedbackId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear selected feedback
  clearSelectedFeedback: () => set({ selectedFeedback: null }),

  // Set selected feedback for viewing details
  setSelectedFeedback: (feedback) => set({ selectedFeedback: feedback }),
}));