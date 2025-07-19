import { create } from "zustand";
import apiClient from "../config/axiosConfig";

const useDashboardStore = create((set, get) => ({
  // State
  dashboardData: {
    cattleStats: {
      totalCattle: 0,
      activeCattle: 0,
      healthyCattle: 0,
      sickCattle: 0,
      quarantinedCattle: 0,
      pregnantCattle: 0,
    },
    todayMilk: 0,
    milkProduction: {
      totalProduction: 0,
      avgProduction: 0,
      recordCount: 0,
    },
    financeStats: {
      totalIncome: 0,
      totalExpenses: 0,
      profit: 0,
      profitPercent: 0,
      transactionCount: 0,
    },
    milkProductionTrend: [],
    healthAlerts: [],
  },
  isLoading: false,
  error: null,
  lastFetched: null,

  // Actions
  fetchDashboardData: async () => {
    // If already loading, prevent duplicate requests
    if (get().isLoading) {
      console.log(
        "Dashboard data fetch already in progress. Skipping request."
      );
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Use the unified dashboard endpoint
      console.log("Fetching dashboard data from API...");
      const response = await apiClient.get("/dashboard/stats");

      // Check for successful response
      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "API returned unsuccessful response"
        );
      }

      const data = response.data.data || {};

      console.log("Raw dashboard data received:", data);

      // Log individual sections for debugging
      console.log("Cattle stats:", data.cattleStats);
      console.log("Today's milk:", data.todayMilk);
      console.log("Milk production:", data.milkProduction);
      console.log("Finance stats:", data.financeStats);
      console.log("Milk trend data:", data.milkTrend);

      // Format milk trend data for chart (with safety checks)
      const milkTrend = data.milkTrend || [];

      console.log("Processing milk trend data:", milkTrend);

      const formattedMilkTrend =
        milkTrend.length > 0
          ? milkTrend
              .map((day) => {
                // Verify the day has valid data
                if (!day || !day.date) {
                  console.warn("Invalid day data in milk trend:", day);
                  return null;
                }

                return {
                  day: new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  }),
                  liters:
                    typeof day.totalProduction === "number"
                      ? day.totalProduction
                      : 0,
                  rawDate: day.date, // Keep the original date for sorting
                };
              })
              .filter(Boolean) // Remove any null entries
              .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)) // Ensure correct sorting
              .slice(-7) // Get last 7 days
              .map(({ day, liters }) => ({ day, liters })) // Remove the rawDate property
          : [];

      console.log("Formatted milk trend data:", formattedMilkTrend);

      // Extract data with safety checks
      const cattleStats = data.cattleStats || {};
      const milkProduction = data.milkProduction || {};
      const financeStats = data.financeStats || {};
      const healthAlerts = data.healthAlerts || [];
      const todayMilk =
        typeof data.todayMilk === "number"
          ? data.todayMilk
          : data.todayMilk?.todayProduction || 0;

      // Ensure data is in the correct format (convert strings to numbers where needed)
      const formattedDashboardData = {
        cattleStats: {
          totalCattle: Number(cattleStats.totalCattle || 0),
          activeCattle: Number(cattleStats.activeCattle || 0),
          healthyCattle: Number(cattleStats.healthyCattle || 0),
          sickCattle: Number(cattleStats.sickCattle || 0),
          quarantinedCattle: Number(cattleStats.quarantinedCattle || 0),
          pregnantCattle: Number(cattleStats.pregnantCattle || 0),
        },
        todayMilk: Number(todayMilk),
        milkProduction: {
          totalProduction: Number(milkProduction.totalProduction || 0),
          avgProduction: Number(milkProduction.avgProduction || 0),
          recordCount: Number(milkProduction.recordCount || 0),
        },
        financeStats: {
          totalIncome: Number(financeStats.totalIncome || 0),
          totalExpenses: Number(financeStats.totalExpenses || 0),
          profit: Number(financeStats.profit || 0),
          profitPercent: Number(financeStats.profitPercent || 0),
          transactionCount: Number(financeStats.transactionCount || 0),
        },
        milkProductionTrend: formattedMilkTrend,
        healthAlerts: healthAlerts || [],
      };

      console.log(
        "Processed dashboard data to be stored:",
        formattedDashboardData
      );

      // Update dashboard data with timestamp
      set({
        dashboardData: formattedDashboardData,
        isLoading: false,
        lastFetched: new Date().toISOString(),
      });

      return formattedDashboardData;
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);

      // Extract the most informative error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load dashboard data";

      console.error("Dashboard error details:", errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
      });

      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDashboardStore;
