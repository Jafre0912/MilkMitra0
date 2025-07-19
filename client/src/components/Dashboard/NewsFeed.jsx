import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaNewspaper,
  FaInfo,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import { RiVirusFill } from "react-icons/ri";
import { TbSunHigh } from "react-icons/tb";
import useNewsAlertStore from "../../store/newsAlertStore";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/news-alerts`
  : "http://localhost:5000/api/news-alerts";

const NewsFeed = () => {
  const { newsAlerts, isLoading, error, fetchNewsAlerts, clearError } =
    useNewsAlertStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [localAlerts, setLocalAlerts] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Direct fetch function as a backup
  const directFetchAlerts = async () => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      console.log("Direct fetching news alerts from:", API_URL);
      const response = await axios.get(API_URL);
      console.log("Direct fetch response:", response.data);

      if (response.data && response.data.status === "success") {
        setLocalAlerts(response.data.data || []);
        toast.success("Alerts loaded successfully");
      } else {
        throw new Error("Failed to load alerts");
      }
    } catch (err) {
      console.error("Direct fetch error:", err);
      setLocalError(err.message || "Failed to load alerts");
      toast.error("Failed to load alerts");
    } finally {
      setLocalLoading(false);
    }
  };

  // Fetch news alerts on component mount using both methods
  useEffect(() => {
    // Try store method first
    fetchNewsAlerts().catch((err) => {
      console.error("Error in news feed fetch from store:", err);
      // If store fetch fails, try direct fetch
      directFetchAlerts();
    });

    // Cleanup
    return () => {
      clearError();
    };
  }, [fetchNewsAlerts, clearError, retryCount]);

  // Handle retry with both methods
  const handleRetry = () => {
    clearError();
    setRetryCount((prev) => prev + 1);
    toast.info("Retrying to fetch news alerts...");

    // Try direct fetch as well
    directFetchAlerts();
  };

  // Use alerts from either source
  const displayAlerts = localAlerts.length > 0 ? localAlerts : newsAlerts;

  // Filter alerts by selected category
  const filteredAlerts =
    selectedCategory === "all"
      ? displayAlerts
      : displayAlerts.filter((alert) => alert.category === selectedCategory);

  // Toggle expanded state for an alert
  const toggleExpand = (alertId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setExpandedAlerts((prev) => ({
      ...prev,
      [alertId]: !prev[alertId],
    }));
  };

  // Get icon for alert category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "industry_trend":
        return <MdTrendingUp className="text-blue-500" />;
      case "disease_outbreak":
        return <RiVirusFill className="text-red-500" />;
      case "seasonal_risk":
        return <TbSunHigh className="text-orange-500" />;
      default:
        return <FaInfo className="text-green-500" />;
    }
  };

  // Get color class based on severity
  const getSeverityColorClass = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return "General";

    return category
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render content with proper formatting
  const renderContent = (content, isExpanded, alertId) => {
    if (!content)
      return <p className="italic text-gray-500">No content available</p>;

    if (isExpanded) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Truncate to ~100 characters for collapsed view
    const truncated =
      content.length > 100 ? content.substring(0, 100) + "..." : content;

    return (
      <>
        <p className="whitespace-pre-wrap">{truncated}</p>
        {content.length > 100 && (
          <button
            className="text-green-600 hover:text-green-800 font-medium text-sm mt-1"
            onClick={(e) => toggleExpand(alertId, e)}
          >
            Read more
          </button>
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaNewspaper className="text-green-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Farmers' Newsfeed & Alerts
          </h3>
        </div>

        {/* Category filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedCategory === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("industry_trend")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedCategory === "industry_trend"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Industry Trends
          </button>
          <button
            onClick={() => setSelectedCategory("disease_outbreak")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedCategory === "disease_outbreak"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Disease Outbreaks
          </button>
          <button
            onClick={() => setSelectedCategory("seasonal_risk")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedCategory === "seasonal_risk"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Seasonal Risks
          </button>
        </div>
      </div>

      <div className="p-5">
        {isLoading || localLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error || localError ? (
          <div className="text-center py-10 text-red-600">
            <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
            <p className="mb-4">
              Failed to load news feed: {error || localError}
            </p>
            <button
              onClick={handleRetry}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center mx-auto"
            >
              <FaSync className="mr-2" /> Retry
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <FaInfo className="mx-auto text-3xl mb-2" />
            <p>No alerts available at the moment.</p>
            {displayAlerts.length > 0 && selectedCategory !== "all" && (
              <p className="mt-2 text-sm">
                Try selecting a different category.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id || `alert-${Math.random()}`}
                className={`p-4 rounded-lg border ${getSeverityColorClass(
                  alert.severity
                )}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 pt-1">
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">
                        {alert.title || "Untitled Alert"}
                      </h4>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {alert.createdAt
                          ? format(new Date(alert.createdAt), "MMM d, yyyy")
                          : "Date unavailable"}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-white bg-opacity-50 mr-2">
                        {formatCategory(alert.category)}
                      </span>
                      {alert.severity === "critical" && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">
                          Critical
                        </span>
                      )}
                    </div>

                    <div className="text-sm">
                      {renderContent(
                        alert.content,
                        expandedAlerts[alert._id],
                        alert._id
                      )}
                    </div>

                    {expandedAlerts[alert._id] && (
                      <button
                        className="text-green-600 hover:text-green-800 font-medium text-sm mt-2"
                        onClick={(e) => toggleExpand(alert._id, e)}
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
