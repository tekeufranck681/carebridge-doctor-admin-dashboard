// src/services/medicationService.js
import api from "../config/axiosConfigMedications";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const medicationService = {
  createMedicationSchedule: async (medicationData) => {
    try {
      console.log("Creating medication schedule with data:", medicationData);
      const response = await api.post("/", medicationData);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to create medication schedule");
    }
  },

  getMedicationSchedules: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch medication schedules");
    }
  },

  getMedicationScheduleById: async (medicationId) => {
    try {
      const response = await api.get(`/${medicationId}`);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch medication schedule");
    }
  },

  updateMedicationSchedule: async (medicationId, patientId, updatedData) => {
    try {
      const response = await api.put(`/${medicationId}?patient_id=${patientId}`, {
        ...updatedData,
      });
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to update medication schedule");
    }
  },

  deleteMedicationSchedule: async (medicationId) => {
    try {
      const response = await api.delete(`/${medicationId}`);
      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to delete medication schedule");
    }
  },
};