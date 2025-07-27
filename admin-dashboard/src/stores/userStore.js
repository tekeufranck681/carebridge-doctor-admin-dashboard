// src/stores/userStore.js
import { create } from "zustand";
import { userService } from "../services/userService";

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  signup: async (userInfo) => {
    set({ isLoading: true, error: null });
    try {
      const { user, message } = await userService.signup(userInfo);
      // Add the new user to the users array
      set((state) => ({
        users: [...state.users, user],
        isLoading: false
      }));
      return { user, message };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateUser: async (userId, userData, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { user, message } = await userService.updateUser(userId, userData);
      
      if (options.silent) {
        set((state) => ({ 
          ...state,
          users: state.users.map(u => u.id === userId ? { ...u, ...user } : u),
          isLoading: false 
        }));
      } else {
        set((state) => ({
          ...state,
          users: state.users.map(u => u.id === userId ? { ...u, ...user } : u),
          isLoading: false
        }));
      }
      
      return { user, message };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  getAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getAllUsers();
      set({ users, isLoading: false });
      return users;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
