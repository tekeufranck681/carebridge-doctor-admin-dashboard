// src/config/axiosConfigAuth.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const AUTH_BASE_URL = `${import.meta.env.VITE_AUTH_BACKEND_URL}/auth`;

const api = axios.create({
  baseURL: AUTH_BASE_URL,
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
      logout(); // Only logout if there was a token and it failed
    }

    return Promise.reject(error); // Let the service/store handle the error
  }
);

export default api;
