// src/services/feedbackService.js
import api from "../config/axiosConfigFeedback";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const feedbackService = {
  // Get all feedbacks (admin only)
  getAllFeedbacks: async () => {
    try {
      const response = await api.get("/");
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch feedbacks");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Fetching feedbacks failed");
    }
  },

  // Get feedback by ID (admin only)
  getFeedbackById: async (feedbackId) => {
    try {
      const response = await api.get(`/${feedbackId}`);
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch feedback");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Fetching feedback failed");
    }
  },

  // Delete feedback by ID (admin only)
  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/${feedbackId}`);
      if (response.data.status !== "success") {
        throw new Error("Failed to delete feedback");
      }
      return response.data;
    } catch (error) {
      normalizeError(error, "Deleting feedback failed");
    }
  },
};