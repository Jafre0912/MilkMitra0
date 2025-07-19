import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCalendarCheck } from "react-icons/fa";
import { FaCow } from "react-icons/fa6";
import { MdProductionQuantityLimits } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiLoader } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";
import useDashboardStore from "../../../store/dashboardStore";
import useCattleStore from "../../../store/cattleStore";
import useMPPStore from "../../../store/mppStore";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "react-toastify";
import NewsFeed from "../../Dashboard/NewsFeed";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    fetchDashboardData,
  } = useDashboardStore();

  const { cattle, fetchCattle, isLoading: cattleLoading } = useCattleStore();
  const {
    fetchMilkCollections,
    fetchStats,
    fetchMPPFinanceTotal,
    stats: mppStats,
    isLoading: mppLoading,
    milkCollections,
  } = useMPPStore();

  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [todayMilkTotal, setTodayMilkTotal] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const navigate = useNavigate();

  // Function to force refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      console.log("Force refreshing dashboard data...");
      await fetchDashboardData();
      await fetchCattle();
      toast.success("Dashboard refreshed successfully");
    } catch (error) {
      console.error("Dashboard refresh error:", error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch dashboard data using the store on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Initial dashboard data load");
        await fetchDashboardData();
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError(error.message || "Failed to load dashboard data");
        toast.error("Failed to load dashboard data. Please try again later.");
      }
    };

    loadDashboardData();
  }, []); // Empty dependency array for initial load

  // Re-fetch data when dependencies change (cattle added/removed, etc)
  useEffect(() => {
    const refreshDataOnChanges = async () => {
      // Only refresh if we've loaded data at least once and we're not already loading
      if (!dashboardLoading && dashboardData && !refreshing) {
        console.log("Refreshing dashboard data due to dependency changes");
        await fetchDashboardData();
      }
    };

    refreshDataOnChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cattle?.length]); // Refresh when cattle count changes

  // Add useEffect to fetch cattle data
  useEffect(() => {
    const loadCattleData = async () => {
      try {
        await fetchCattle();
      } catch (error) {
        console.error("Site data fetch error:", error);
      }
    };

    loadCattleData();
  }, [fetchCattle]);

  // Set error from store if available
  useEffect(() => {
    if (dashboardError) {
      setError(dashboardError);
    }
  }, [dashboardError]);

  // Add debug logging to check what data we're receiving
  useEffect(() => {
    if (dashboardData) {
      console.log("Dashboard data received:", dashboardData);
      console.log("Today milk value:", dashboardData.todayMilk);
    }
  }, [dashboardData]);

  // Add useEffect to fetch today's milk collection data
  useEffect(() => {
    const fetchTodayMilkData = async () => {
      try {
        // Set up today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayISOString = today.toISOString();

        // Set the end date to the end of today
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayISOString = endOfToday.toISOString();

        // Fetch milk collections for today
        const collections = await fetchMilkCollections({
          startDate: todayISOString,
          endDate: endOfTodayISOString,
        });

        // Get the stats for today as well
        await fetchStats({
          startDate: todayISOString,
          endDate: endOfTodayISOString,
        });

        // Calculate total milk collected today if we have collections
        if (collections && collections.length > 0) {
          const total = collections.reduce(
            (sum, record) => sum + (record.quantity || 0),
            0
          );
          setTodayMilkTotal(total);
          console.log("Today's milk total from MPP:", total);
        }
      } catch (error) {
        console.error("Error fetching today's milk data:", error);
      }
    };

    fetchTodayMilkData();
  }, [fetchMilkCollections, fetchStats]);

  // Add useEffect to fetch today's revenue data
  useEffect(() => {
    const fetchTodayRevenueData = async () => {
      try {
        // Set up today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISOString = today.toISOString();

        // Set the end date to the end of today
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayISOString = endOfToday.toISOString();

        // Fetch financial data for today
        const financeData = await fetchMPPFinanceTotal(
          todayISOString,
          endOfTodayISOString
        );

        if (financeData) {
          console.log("Today's revenue data:", financeData);
          setTodayRevenue(financeData.totalAmount || 0);
        }
      } catch (error) {
        console.error("Error fetching today's revenue data:", error);
      }
    };

    fetchTodayRevenueData();
  }, [fetchMPPFinanceTotal]);

  // Add useEffect to fetch 7 days of milk collections for the trend chart
  useEffect(() => {
    const fetchMilkCollectionTrendData = async () => {
      try {
        // Set up date for filtering (7 days ago)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const startDateISOString = sevenDaysAgo.toISOString();

        // Set the end date to the end of today
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayISOString = endOfToday.toISOString();

        // Fetch milk collections for the last 7 days
        await fetchMilkCollections({
          startDate: startDateISOString,
          endDate: endOfTodayISOString,
        });

        console.log("Fetched 7-day milk collection trend data");
      } catch (error) {
        console.error("Error fetching milk collection trend data:", error);
      }
    };

    fetchMilkCollectionTrendData();
  }, [fetchMilkCollections]);

  // Add helper function to format milk trend data from MPP collections
  const getCollectionTrendData = () => {
    // If no collections, return empty array
    if (!milkCollections || milkCollections.length === 0) {
      // Return default data with last 7 days
      return Array(7)
        .fill(null)
        .map((_, i) => {
          const day = new Date();
          day.setDate(day.getDate() - (6 - i));
          return {
            day: day.toLocaleDateString("en-US", { weekday: "short" }),
            liters: 0,
            rawDate: day.toISOString(), // Keep raw date for reference
          };
        });
    }

    // First, group collections by date
    const collectionsByDate = {};

    // Process all collections and group by date
    milkCollections.forEach((collection) => {
      // Format date as YYYY-MM-DD to use as key
      const dateKey = new Date(collection.collectionDate)
        .toISOString()
        .split("T")[0];

      if (!collectionsByDate[dateKey]) {
        collectionsByDate[dateKey] = {
          totalQuantity: 0,
          date: dateKey,
          day: new Date(dateKey).toLocaleDateString("en-US", {
            weekday: "short",
          }),
        };
      }

      // Add quantity to day's total
      collectionsByDate[dateKey].totalQuantity += collection.quantity || 0;
    });

    // Convert to array and sort by date
    const result = Object.values(collectionsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7) // Get only the last 7 days
      .map((item) => ({
        day: item.day,
        liters: Number(item.totalQuantity.toFixed(1)),
        rawDate: item.date,
      }));

    // If we have less than 7 days of data, pad with empty days
    if (result.length < 7) {
      // Generate array of last 7 days
      const last7Days = Array(7)
        .fill(null)
        .map((_, i) => {
          const day = new Date();
          day.setDate(day.getDate() - (6 - i));
          const dateStr = day.toISOString().split("T")[0];
          return {
            dateStr,
            day: day.toLocaleDateString("en-US", { weekday: "short" }),
          };
        });

      // Create a map of existing data
      const existingData = {};
      result.forEach((item) => {
        existingData[item.rawDate] = item;
      });

      // Fill in missing days with zeros
      return last7Days.map((day) => {
        if (existingData[day.dateStr]) {
          return existingData[day.dateStr];
        }
        return {
          day: day.day,
          liters: 0,
          rawDate: day.dateStr,
        };
      });
    }

    return result;
  };

  // Handler for quick action buttons
  const handleQuickAction = (action) => {
    console.log(`Quick action clicked: ${action}`);
    // Navigate to the appropriate page based on the action
    switch (action) {
      case "Add Cattle":
        navigate("/dashboard/cattle");
        break;
      case "Record Milk":
        navigate("/dashboard/milk-production");
        break;
      case "Health Check":
        navigate("/dashboard/disease-prediction");
        break;
      case "Veterinary Services":
        navigate("/dashboard/veterinary-services");
        break;
      default:
        alert(`${action} feature coming soon!`);
    }
  };

  // Add function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();

    // Adjust year if birth month hasn't occurred yet this year
    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }

    // For young calves, show months instead of years
    if (years < 1) {
      const ageMonths = months + 12;
      return `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;
    }

    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  // Handler for navigating to cattle details
  const handleCattleClick = (cattleId) => {
    navigate(`/dashboard/cattle/${cattleId}`);
  };

  // Handler for "View All" buttons
  const handleViewAll = (section) => {
    console.log(`View all clicked for: ${section}`);
    switch (section) {
      case "health":
        navigate("/dashboard/cattle");
        break;
      case "activities":
        navigate("/dashboard/activities");
        break;
      case "notifications":
        navigate("/dashboard/notifications");
        break;
      default:
      // Do nothing
    }
  };

  // Add helper function to get health status distribution from cattle data
  const getHealthDistribution = () => {
    if (!cattle || cattle.length === 0) return [];

    const healthStats = {
      healthy: 0,
      sick: 0,
      quarantined: 0,
      pregnant: 0,
    };

    cattle.forEach((cattleItem) => {
      const status = cattleItem.healthStatus?.status || "healthy";
      if (Object.prototype.hasOwnProperty.call(healthStats, status)) {
        healthStats[status]++;
      }
    });

    // Transform into chart data format
    return Object.keys(healthStats)
      .map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: healthStats[key],
      }))
      .filter((item) => item.value > 0); // Only include statuses with at least one cattle
  };

  // Ensure we have valid data references with better default values
  const {
    cattleStats = {},
    todayMilk = null,
    milkProduction = {},
    financeStats = {},
    milkProductionTrend = [],
    healthAlerts = [],
  } = dashboardData || {};

  // Get the milk production value with fallbacks
  const getMilkProductionValue = () => {
    // First priority: Use MPP data for today
    if (typeof todayMilkTotal === "number" && todayMilkTotal > 0) {
      return todayMilkTotal.toFixed(1);
    }

    // Second priority: Use MPP stats if available
    if (
      mppStats &&
      typeof mppStats.totalQuantity === "number" &&
      mppStats.totalQuantity > 0
    ) {
      return mppStats.totalQuantity.toFixed(1);
    }

    // Third priority: Dashboard todayMilk
    if (typeof todayMilk === "number" && todayMilk > 0) {
      return todayMilk.toFixed(1);
    }

    // Fourth priority: Check if there's milk production data in another form
    if (milkProduction && typeof milkProduction.totalProduction === "number") {
      return (milkProduction.avgProduction || 0).toFixed(1);
    }

    // As a last resort, check if there's trend data and use the latest day
    if (milkProductionTrend && milkProductionTrend.length > 0) {
      const latestDay = milkProductionTrend[milkProductionTrend.length - 1];
      if (latestDay && typeof latestDay.liters === "number") {
        return latestDay.liters.toFixed(1);
      }
    }

    return "0.0";
  };

  // Add helper function to get revenue value with fallbacks
  const getRevenueValue = () => {
    // First priority: Use MPP revenue data for today
    if (typeof todayRevenue === "number" && todayRevenue > 0) {
      return todayRevenue;
    }

    // Second priority: Use dashboard finance stats
    if (financeStats?.totalIncome) {
      return financeStats.totalIncome;
    }

    // Default to 0 if no data is available
    return 0;
  };

  // Authentication check
  if (!isAuthenticated && !dashboardLoading) {
    return <Navigate to="/auth/login" />;
  }

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <FiLoader className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            Welcome back, {user?.name || "Farm Manager"}
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your farm today
          </p>
        </div>
        {/*<button
          onClick={refreshDashboard}
          disabled={dashboardLoading || refreshing}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {refreshing || dashboardLoading ? (
            <FiLoader className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>*/}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Some data could not be loaded. Showing available information.
            <button
              className="ml-2 underline text-yellow-600"
              onClick={refreshDashboard}
            >
              Retry
            </button>
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cattle Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-green-600">
              <FaCow className="h-8 w-8" />
            </div>
            <div className="text-xs font-medium text-gray-500 flex items-center">
              <span>Total</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Cattle</h3>
          <div className="flex items-end">
            {dashboardLoading ? (
              <div className="flex items-center">
                <FiLoader className="animate-spin h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">
                  {cattle && cattle.length > 0
                    ? cattle.length
                    : cattleStats?.totalCattle || 0}
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">animals</p>
              </>
            )}
          </div>
        </div>

        {/* Milk Production Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-green-600">
              <MdProductionQuantityLimits className="h-8 w-8" />
            </div>
            <div className="text-xs font-medium text-gray-500 flex items-center">
              <span>Today</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Milk Production
          </h3>
          <div className="flex items-end">
            {dashboardLoading || mppLoading ? (
              <div className="flex items-center">
                <FiLoader className="animate-spin h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">
                  {getMilkProductionValue()}
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">liters</p>
              </>
            )}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-green-600">
              <FaMoneyBillWave className="h-8 w-8" />
            </div>
            <div className="text-xs font-medium text-gray-500 flex items-center">
              <span>Today</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Revenue</h3>
          <div className="flex items-end">
            {dashboardLoading || mppLoading ? (
              <div className="flex items-center">
                <FiLoader className="animate-spin h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{getRevenueValue().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">INR</p>
              </>
            )}
          </div>
        </div>

        {/* Health Issues Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-green-600">
              <FaCalendarCheck className="h-8 w-8" />
            </div>
            <div className="text-xs font-medium text-gray-500 flex items-center">
              <span>Health</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Health Issues
          </h3>
          <div className="flex items-end">
            {dashboardLoading || cattleLoading ? (
              <div className="flex items-center">
                <FiLoader className="animate-spin h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">
                  {(cattle &&
                    cattle.filter(
                      (c) =>
                        c.healthStatus?.status === "sick" ||
                        c.healthStatus?.status === "quarantined"
                    ).length) ||
                    cattleStats?.sickCattle +
                      (cattleStats?.quarantinedCattle || 0) ||
                    0}
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">cattle</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-2 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">
              Milk Production Overview
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <BsThreeDotsVertical />
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCollectionTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} liters`, "Production"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="liters"
                  stroke="#16a34a"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Milk Production"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4">
            {dashboardLoading || mppLoading ? (
              <div className="w-full flex justify-center items-center">
                <FiLoader className="animate-spin h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading stats...</span>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold">
                    {mppStats?.avgFat
                      ? `${mppStats.avgFat.toFixed(1)}% Fat`
                      : `${parseFloat(
                          milkProduction.avgProduction || 0
                        ).toFixed(1)}L`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Records</p>
                  <p className="font-semibold">
                    {mppStats?.recordCount || milkProduction.recordCount || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="font-semibold">{getMilkProductionValue()}L</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold">
                    {mppStats?.totalQuantity
                      ? `${mppStats.totalQuantity.toFixed(1)}L`
                      : `${parseFloat(
                          milkProduction.totalProduction || 0
                        ).toFixed(0)}L`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Health Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">
              Cattle Health Distribution
            </h3>
            <button
              onClick={() => handleViewAll("health")}
              className="text-sm text-green-600 hover:text-green-700"
            >
              View All
            </button>
          </div>
          <div className="h-64 bg-white rounded-lg flex items-center justify-center">
            {cattleLoading ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin h-6 w-6 text-green-600" />
              </div>
            ) : (
              <>
                {cattle.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getHealthDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={1}
                        stroke="#ffffff"
                      >
                        {getHealthDistribution().map((entry, index) => {
                          // Modern color palette
                          const colors = {
                            Healthy: "#10b981", // emerald-500
                            Sick: "#ef4444", // red-500
                            Pregnant: "#3b82f6", // blue-500
                            Quarantined: "#f59e0b", // amber-500
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[entry.name] || "#d1d5db"}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          border: "none",
                          padding: "8px 12px",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                        }}
                        formatter={(value, name) => [
                          `${value} cattle (${(
                            (value / cattle.length) *
                            100
                          ).toFixed(1)}%)`,
                          name,
                        ]}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500">No health data available</p>
                    <button
                      onClick={() => navigate("/dashboard/cattle/")}
                      className="mt-3 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      Add Cattle
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {getHealthDistribution().map((status, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full"
              >
                <p className="text-xs font-medium text-gray-700">
                  {status.name}: {status.value}
                  <span className="text-gray-500 ml-1">
                    ({((status.value / cattle.length) * 100).toFixed(0)}%)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Health Alerts</h3>
            <button
              onClick={() => handleViewAll("health")}
              className="text-sm text-green-600 hover:text-green-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {healthAlerts && healthAlerts.length > 0 ? (
              healthAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <div className="flex-shrink-0 mr-3">
                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <FaCow className="text-red-500" />
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">
                      {alert.name}{" "}
                      <span className="text-gray-500 text-sm">
                        (Tag: {alert.tagId})
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span className="text-red-600 font-medium">
                        {alert.healthStatus?.status}
                      </span>
                    </p>
                    <div className="flex mt-1 text-xs text-gray-500">
                      <span className="mr-3">{alert.breed}</span>
                      <span>{alert.gender}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <FaCow className="text-green-500 h-6 w-6" />
                </div>
                <p className="text-gray-700 font-medium">
                  No health alerts at this time
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  All your cattle are in good health
                </p>
                <button
                  onClick={() => navigate("/dashboard/disease-prediction")}
                  className="mt-4 text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Run Health Check
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cattle Health Status */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Cattle Health Status</h3>
            <button
              onClick={() => handleViewAll("health")}
              className="text-sm text-green-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            {cattleLoading ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin h-6 w-6 text-green-600" />
              </div>
            ) : cattle.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breed
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cattle.slice(0, 4).map((cattleItem) => (
                    <tr
                      key={cattleItem._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCattleClick(cattleItem._id)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {cattleItem.tagId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {cattleItem.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {cattleItem.breed}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {calculateAge(cattleItem.dateOfBirth)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            cattleItem.healthStatus?.status === "healthy"
                              ? "bg-green-100 text-green-800"
                              : cattleItem.healthStatus?.status === "pregnant"
                              ? "bg-blue-100 text-blue-800"
                              : cattleItem.healthStatus?.status ===
                                "quarantined"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cattleItem.healthStatus?.status
                            ? cattleItem.healthStatus.status
                                .charAt(0)
                                .toUpperCase() +
                              cattleItem.healthStatus.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600">No cattle found</p>
                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  onClick={() => navigate("/dashboard/cattle/")}
                >
                  Add Cattle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: "🐄", label: "Add Cattle" },
            { icon: "🥛", label: "Record Milk" },
            { icon: "🩺", label: "Health Check" },
            { icon: "🔬", label: "Veterinary Services" },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.label)}
              className="bg-white flex flex-col items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-green-100"
            >
              <span className="text-2xl mb-2">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Section */}
      <div id="news-feed" className="mt-8">
        <NewsFeed />
      </div>
    </div>
  );
};

export default Dashboard;
