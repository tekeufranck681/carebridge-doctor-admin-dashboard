
// src/services/userService.js
import api from "../config/axiosConfigAuth";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const userService = {
  signup: async (credentials) => {
    try {
      const response = await api.post("/register", credentials);
      const { user } = response.data.data;
      return { user, message: "Registration successful" };
    } catch (error) {
      normalizeError(error, "Signup failed");
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      const user = response.data.data;
      return { user, message: "User updated successfully" };
    } catch (error) {
      normalizeError(error, "Failed to update user");
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get("/users");
      if (response.data.status !== "success") {
        throw new Error("Failed to fetch users");
      }
      return response.data.data;
    } catch (error) {
      normalizeError(error, "Failed to fetch users");
    }
  },
};

