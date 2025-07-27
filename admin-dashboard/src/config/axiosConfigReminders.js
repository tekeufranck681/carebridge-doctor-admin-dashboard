// src/config/axiosConfigReminders.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const REMINDERS_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/reminders`;

const api = axios.create({
  baseURL: REMINDERS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();
    const token = localStorage.getItem("token");
    const status = error.response?.status;

    if (status === 401 && token) {
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;