// src/stores/appointmentStore.js
import { create } from "zustand";
import { appointmentService } from "../services/appointmentService";

export const useAppointmentStore = create((set) => ({
  appointments: [],
  selectedAppointment: null,
  isAppointmentLoading: false,
  error: null,

  createAppointment: async (appointmentData) => {
    set({ isAppointmentLoading: true, error: null });
    try {
      const appointment = await appointmentService.createAppointment(
        appointmentData
      );
      set((state) => ({
        appointments: [...state.appointments, appointment],
        isAppointmentLoading: false,
      }));
      return appointment;
    } catch (error) {
      set({ isAppointmentLoading: false, error: error.message });
      throw error;
    }
  },

  fetchAppointments: async (status = null) => {
    set({ isAppointmentLoading: true, error: null });
    try {
      const appointments = await appointmentService.getAppointments(status);
      set({ appointments, isAppointmentLoading: false });
      return appointments;
    } catch (error) {
      set({ isAppointmentLoading: false, error: error.message });
      throw error;
    }
  },

  updateAppointment: async (appointmentId, patientId, updatedData) => {
    set({ isAppointmentLoading: true, error: null });
    try {
      const updatedAppointment = await appointmentService.updateAppointment(
        appointmentId,
        patientId,
        updatedData
      );
      set((state) => ({
        appointments: state.appointments.map((appt) =>
          appt.id === appointmentId ? updatedAppointment : appt
        ),
        isAppointmentLoading: false,
      }));
      return updatedAppointment;
    } catch (error) {
      set({ isAppointmentLoading: false, error: error.message });
      throw error;
    }
  },

  cancelAppointment: async (appointmentId) => {
    set({ isAppointmentLoading: true, error: null });
    try {
      const cancelledAppointment = await appointmentService.cancelAppointment(
        appointmentId
      );
      set((state) => ({
        appointments: state.appointments.map((appt) =>
          appt.id === appointmentId ? cancelledAppointment : appt
        ),
        isAppointmentLoading: false,
      }));
      return cancelledAppointment;
    } catch (error) {
      set({ isAppointmentLoading: false, error: error.message });
      throw error;
    }
  },

  selectAppointment: (appointment) => set({ selectedAppointment: appointment }),

  clearError: () => set({ error: null }),
}));