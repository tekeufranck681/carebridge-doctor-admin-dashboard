// src/stores/medicationStore.js
import { create } from "zustand";
import { medicationService } from "../services/medicationService";

export const useMedicationStore = create((set) => ({
  medications: [],
  selectedMedicationSchedule: null,
  isMedicationLoading: false,
  error: null,

  createMedicationSchedule: async (medicationData) => {
    set({ isMedicationLoading: true, error: null });
    try {
      const schedule = await medicationService.createMedicationSchedule(
        medicationData
      );
      set((state) => ({
        medications: [...state.medications, schedule],
        isMedicationLoading: false,
      }));
      return schedule;
    } catch (error) {
      set({ isMedicationLoading: false, error: error.message });
      throw error;
    }
  },

  fetchMedicationSchedules: async () => {
    set({ isMedicationLoading: true, error: null });
    try {
      const schedules = await medicationService.getMedicationSchedules();
      set({ medications: schedules, isMedicationLoading: false });
      return schedules;
    } catch (error) {
      set({ isMedicationLoading: false, error: error.message });
      throw error;
    }
  },

  fetchMedicationScheduleById: async (medicationId) => {
    set({ isMedicationLoading: true, error: null });
    try {
      const schedule = await medicationService.getMedicationScheduleById(
        medicationId
      );
      set({ selectedMedicationSchedule: schedule, isMedicationLoading: false });
      return schedule;
    } catch (error) {
      set({ isMedicationLoading: false, error: error.message });
      throw error;
    }
  },

  updateMedicationSchedule: async (medicationId, patientId, updatedData) => {
    set({ isMedicationLoading: true, error: null });
    try {
      const updatedSchedule = await medicationService.updateMedicationSchedule(
        medicationId,
        patientId,
        updatedData
      );
      set((state) => ({
        medications: state.medications.map((schedule) =>
          schedule.id === medicationId ? updatedSchedule : schedule
        ),
        isMedicationLoading: false,
      }));
      return updatedSchedule;
    } catch (error) {
      set({ isMedicationLoading: false, error: error.message });
      throw error;
    }
  },

  deleteMedicationSchedule: async (medicationId) => {
    set({ isMedicationLoading: true, error: null });
    try {
      await medicationService.deleteMedicationSchedule(medicationId);
      set((state) => ({
        medications: state.medications.filter(
          (schedule) => schedule.id !== medicationId
        ),
        isMedicationLoading: false,
      }));
    } catch (error) {
      set({ isMedicationLoading: false, error: error.message });
      throw error;
    }
  },

  selectMedicationSchedule: (schedule) =>
    set({ selectedMedicationSchedule: schedule }),

  clearError: () => set({ error: null }),
}));