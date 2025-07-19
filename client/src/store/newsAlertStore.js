import { create } from "zustand";
import axios from "axios";

// Use environment variable for API URL or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/news-alerts`
  : "http://localhost:5000/api/news-alerts";

console.log("News Alerts API URL:", API_URL); // Debug log

const useNewsAlertStore = create((set, get) => ({
  // State
  newsAlerts: [],
  currentAlert: null,
  isLoading: false,
  error: null,

  // Actions
  fetchNewsAlerts: async (category = null) => {
    set({ isLoading: true, error: null });
    console.log("Starting news alert fetch, category:", category);

    try {
      let url = API_URL;
      if (category && category !== "all") {
        url += `?category=${category}`;
      }

      console.log("Fetching news alerts from:", url); // Debug log

      // Attempt to fetch without credentials first (for debug endpoint)
      console.log("Trying debug endpoint first...");
      try {
        const debugResponse = await axios.get(`${API_URL}/debug`);
        console.log("Debug endpoint response:", debugResponse.data);
      } catch (debugErr) {
        console.warn("Debug endpoint check failed:", debugErr.message);
      }

      // Now fetch the actual data
      const response = await axios.get(url, { withCredentials: true });
      console.log("News alerts response data:", response.data); // Debug log

      if (response.data && response.data.status === "success") {
        set({
          newsAlerts: response.data.data || [],
          isLoading: false,
        });
        return response.data.data || [];
      } else {
        console.warn("Response not successful:", response.data);
        throw new Error(
          response.data?.message || "Failed to fetch news alerts"
        );
      }
    } catch (error) {
      console.error("Error fetching news alerts:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch news alerts";
      console.error("Error message:", errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
        newsAlerts: [], // Ensure we have an empty array on error
      });
      return [];
    }
  },

  fetchNewsAlertById: async (id) => {
    set({ isLoading: true, error: null, currentAlert: null });

    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        withCredentials: true,
      });

      if (response.data && response.data.status === "success") {
        set({
          currentAlert: response.data.data,
          isLoading: false,
        });
        return response.data.data;
      }

      throw new Error("Failed to fetch news alert");
    } catch (error) {
      console.error("Error fetching news alert:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch news alert",
        isLoading: false,
      });
      return null;
    }
  },

  createNewsAlert: async (alertData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(API_URL, alertData, {
        withCredentials: true,
      });

      if (response.data && response.data.status === "success") {
        // Add new alert to the state
        set((state) => ({
          newsAlerts: [response.data.data, ...state.newsAlerts],
          isLoading: false,
        }));
        return response.data.data;
      }

      throw new Error("Failed to create news alert");
    } catch (error) {
      console.error("Error creating news alert:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create news alert",
        isLoading: false,
      });
      return null;
    }
  },

  updateNewsAlert: async (id, alertData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`${API_URL}/${id}`, alertData, {
        withCredentials: true,
      });

      if (response.data && response.data.status === "success") {
        // Update the alert in the state
        set((state) => ({
          newsAlerts: state.newsAlerts.map((alert) =>
            alert._id === id ? response.data.data : alert
          ),
          currentAlert: response.data.data,
          isLoading: false,
        }));
        return response.data.data;
      }

      throw new Error("Failed to update news alert");
    } catch (error) {
      console.error("Error updating news alert:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update news alert",
        isLoading: false,
      });
      return null;
    }
  },

  deleteNewsAlert: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });

      // Remove the alert from the state
      set((state) => ({
        newsAlerts: state.newsAlerts.filter((alert) => alert._id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Error deleting news alert:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete news alert",
        isLoading: false,
      });
      return false;
    }
  },

  toggleActiveStatus: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch(
        `${API_URL}/${id}/toggle-active`,
        {},
        { withCredentials: true }
      );

      if (response.data && response.data.status === "success") {
        // Update the alert in the state
        set((state) => ({
          newsAlerts: state.newsAlerts.map((alert) =>
            alert._id === id ? response.data.data : alert
          ),
          currentAlert:
            state.currentAlert?._id === id
              ? response.data.data
              : state.currentAlert,
          isLoading: false,
        }));
        return response.data.data;
      }

      throw new Error("Failed to toggle alert status");
    } catch (error) {
      console.error("Error toggling alert status:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to toggle alert status",
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useNewsAlertStore;
