// src/services/patientService.js
import api from "../config/axiosConfigAuth";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  throw new Error(message);
};

export const patientService = {
  // List patients (admin and doctor)
  listPatients: async () => {
    try {
      const response = await api.get("/patients/");
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch patients");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Fetching patients failed");
    }
  },

  // Get patient by ID (admin and assigned doctor)
  getPatientById: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch patient");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Fetching patient failed");
    }
  },

  // Register a patient (doctor only)
  registerPatient: async ({ patientData, doctorId, department }) => {
    try {
      const params = new URLSearchParams({ doctor_id: doctorId, department });
      const response = await api.post(
        `/patients/register?${params.toString()}`,
        patientData
      );
      if (response.data.status !== "success") {
        throw new Error("Patient registration failed");
      }
      return response.data.data.patient;
    } catch (error) {
      console.error(error.response?.data || error.message);

      normalizeError(error, "Patient registration failed");
    }
  },

  // Delete patient (admin only)
  deletePatient: async (patientId) => {
    try {
      const response = await api.delete(`/patients/${patientId}`);
      if (response.data.status !== "deleted") {
        throw new Error("Failed to delete patient");
      }
      return response.data;
    } catch (error) {
      normalizeError(error, "Deleting patient failed");
    }
  },

  // Check doctor-patient link (doctor only)
  checkDoctorPatientLink: async (doctorId, patientId) => {
    try {
      const response = await api.get(
        `/doctors/${doctorId}/patients/${patientId}/check`
      );
      if (response.data.status !== "success") {
        throw new Error("Doctor-patient link check failed");
      }
      return response.data.linked;
    } catch (error) {
      normalizeError(error, "Checking doctor-patient link failed");
    }
  },
};
