// src/stores/patientStore.js
import { create } from "zustand";
import { patientService } from "../services/patientService";

export const usePatientStore = create((set) => ({
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Fetch list of patients (admin or doctor)
  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const patients = await patientService.listPatients();
      set({ patients, isLoading: false });
      return patients;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get a single patient by ID (admin or assigned doctor)
  getPatientById: async (patientId) => {
    set({ isLoading: true, error: null });
    try {
      const patient = await patientService.getPatientById(patientId);
      set({ selectedPatient: patient, isLoading: false });
      return patient;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Register a new patient (doctor only)
  registerPatient: async ({ patientData, doctorId, department }) => {
    set({ isLoading: true, error: null });
    try {
      const patient = await patientService.registerPatient({ patientData, doctorId, department });
      set((state) => ({
        patients: [...state.patients, patient],
        isLoading: false,
      }));
      return patient;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete a patient (admin only)
  deletePatient: async (patientId) => {
    set({ isLoading: true, error: null });
    try {
      await patientService.deletePatient(patientId);
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== patientId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Check if doctor is linked to patient (doctor only)
  checkDoctorPatientLink: async (doctorId, patientId) => {
    set({ isLoading: true, error: null });
    try {
      const linked = await patientService.checkDoctorPatientLink(doctorId, patientId);
      set({ isLoading: false });
      return linked;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
