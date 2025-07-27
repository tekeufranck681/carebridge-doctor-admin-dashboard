// src/services/appointmentService.js
import api from "../config/axiosConfigAppointments";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post("/", appointmentData);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to create appointment");
    }
  },

  getAppointments: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get("/", { params });
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch appointments");
    }
  },

  updateAppointment: async (appointmentId, patientId, updatedData) => {
    try {
      const response = await api.put(`/${appointmentId}?patient_id=${patientId}`, {
        ...updatedData,
      });
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to update appointment");
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.post(`/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to cancel appointment");
    }
  },
};