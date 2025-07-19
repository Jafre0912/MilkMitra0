import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { MdTrendingUp, MdOutlineCategory } from "react-icons/md";
import { RiVirusFill } from "react-icons/ri";
import { TbSunHigh } from "react-icons/tb";
import useNewsAlertStore from "../../../store/newsAlertStore";
import useAuthStore from "../../../store/authStore";
import { toast } from "react-toastify";

const NewsAlertManagement = () => {
  const { user } = useAuthStore();
  const {
    newsAlerts,
    isLoading,
    error,
    fetchNewsAlerts,
    createNewsAlert,
    updateNewsAlert,
    deleteNewsAlert,
    toggleActiveStatus,
  } = useNewsAlertStore();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create or edit
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    severity: "medium",
    expiryDate: "",
    isActive: true,
  });

  // Fetch news alerts on component mount
  useEffect(() => {
    fetchNewsAlerts();
  }, [fetchNewsAlerts]);

  // Set form data when editing an alert
  useEffect(() => {
    if (selectedAlert && formMode === "edit") {
      setFormData({
        title: selectedAlert.title || "",
        content: selectedAlert.content || "",
        category: selectedAlert.category || "general",
        severity: selectedAlert.severity || "medium",
        expiryDate: selectedAlert.expiryDate
          ? new Date(selectedAlert.expiryDate).toISOString().split("T")[0]
          : "",
        isActive: selectedAlert.isActive,
      });
    }
  }, [selectedAlert, formMode]);

  // Reset form when closing
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      severity: "medium",
      expiryDate: "",
      isActive: true,
    });
    setSelectedAlert(null);
    setFormMode("create");
    setShowForm(false);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formMode === "create") {
        await createNewsAlert(formData);
        toast.success("News alert created successfully");
      } else {
        await updateNewsAlert(selectedAlert._id, formData);
        toast.success("News alert updated successfully");
      }

      resetForm();
      fetchNewsAlerts(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to save news alert");
    }
  };

  // Handle alert deletion
  const handleDelete = async (alertId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this alert? This action cannot be undone."
      )
    ) {
      try {
        await deleteNewsAlert(alertId);
        toast.success("News alert deleted successfully");
      } catch (error) {
        toast.error(error.message || "Failed to delete news alert");
      }
    }
  };

  // Handle toggling alert active status
  const handleToggleStatus = async (alertId) => {
    try {
      await toggleActiveStatus(alertId);
      toast.success("Alert status updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update alert status");
    }
  };

  // Handle edit button click
  const handleEditClick = (alert) => {
    setSelectedAlert(alert);
    setFormMode("edit");
    setShowForm(true);
  };

  // Get icon for alert category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "industry_trend":
        return <MdTrendingUp className="text-blue-500 text-lg" />;
      case "disease_outbreak":
        return <RiVirusFill className="text-red-500 text-lg" />;
      case "seasonal_risk":
        return <TbSunHigh className="text-orange-500 text-lg" />;
      default:
        return <MdOutlineCategory className="text-green-500 text-lg" />;
    }
  };

  // Format category for display
  const formatCategory = (category) => {
    return category
      ?.replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case "low":
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Low
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Manage News & Alerts
        </h2>

        <button
          onClick={() => {
            setFormMode("create");
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus /> Add New Alert
        </button>
      </div>

      {/* Alert Form */}
      {showForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">
            {formMode === "create" ? "Create New Alert" : "Edit Alert"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="general">General</option>
                    <option value="industry_trend">Industry Trend</option>
                    <option value="disease_outbreak">Disease Outbreak</option>
                    <option value="seasonal_risk">Seasonal Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center h-full pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : formMode === "create"
                  ? "Create Alert"
                  : "Update Alert"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
          Error loading news alerts: {error}
        </div>
      ) : isLoading && newsAlerts.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : newsAlerts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No news alerts have been created yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newsAlerts.map((alert) => (
                <tr key={alert._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {alert.content.length > 60
                        ? alert.content.slice(0, 60) + "..."
                        : alert.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(alert.category)}
                      <span className="ml-1 text-sm text-gray-900">
                        {formatCategory(alert.category)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(alert.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GrStatusGood
                        className={`mr-1 ${
                          alert.isActive ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span className="text-sm text-gray-900">
                        {alert.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(alert.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(alert._id)}
                        className={`p-1 rounded ${
                          alert.isActive
                            ? "text-green-600 hover:text-green-900"
                            : "text-red-600 hover:text-red-900"
                        }`}
                        title={alert.isActive ? "Deactivate" : "Activate"}
                      >
                        {alert.isActive ? (
                          <FaToggleOn size={20} />
                        ) : (
                          <FaToggleOff size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(alert)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NewsAlertManagement;
