import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  FiLoader,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { BiReset } from "react-icons/bi";
import useMPPStore from "../../../store/mppStore";
import useAuthStore from "../../../store/authStore";
import apiClient from "../../../config/axiosConfig";
import MilkCollectionForm from "./MilkCollectionForm";
import MilkCollectionList from "./MilkCollectionList";
import MilkCollectionStats from "./MilkCollectionStats";
import { FaPlus } from "react-icons/fa";

const MPPDashboard = ({ embedded }) => {
  const { user } = useAuthStore();
  const {
    milkCollections,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    fetchMilkCollections,
    fetchStats,
    fetchShiftStats,
  } = useMPPStore();

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!user || !useAuthStore.getState().token) {
      console.warn("User not authenticated or missing token");
      setAuthError("You need to be logged in to manage milk collections");
    } else {
      setAuthError(null);
      console.log("User authenticated:", user);
    }
  }, [user]);

  // Load data on component mount
  useEffect(() => {
    fetchMilkCollections();
    fetchStats();
    fetchShiftStats();
  }, [fetchMilkCollections, fetchStats, fetchShiftStats]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  // Apply filters
  const applyFilters = () => {
    fetchMilkCollections();
    fetchStats();
    fetchShiftStats();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    clearFilters();
    fetchMilkCollections();
    fetchStats();
    fetchShiftStats();
    setShowFilters(false);
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Open form for new entry
  const handleAddNew = () => {
    if (!isAdmin) {
      toast.error("Only administrators can add milk collection records");
      return;
    }
    setEditMode(false);
    setEditId(null);
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (id) => {
    if (!isAdmin) {
      toast.error("Only administrators can edit milk collection records");
      return;
    }
    setEditMode(true);
    setEditId(id);
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
  };

  // Handle form submission (handled in the form component)

  if (authError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error</p>
          <p className="text-gray-600">{authError}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchMilkCollections}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded ? "" : "py-6 px-4 sm:px-6 md:px-8 bg-gray-50 min-h-screen"
      }
    >
      <div
        className={
          embedded
            ? "flex justify-between items-center mb-6"
            : "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        }
      >
        {!embedded && (
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Milk Collection Management
          </h1>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>

          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <FaPlus className="mr-2" />
              New Collection
            </button>
          )}
        </div>
      </div>

      {/* Notice for non-admin users */}
      {!isAdmin && !embedded && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                As a farmer, you can only view your own milk collection records.
                Please contact an administrator to add or modify records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-md shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FiCalendar className="inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FiCalendar className="inline mr-1" /> End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="shift"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Shift
              </label>
              <select
                id="shift"
                name="shift"
                value={filters.shift}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Shifts</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="milkType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Milk Type
              </label>
              <select
                id="milkType"
                name="milkType"
                value={filters.milkType}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="C">Cow (C)</option>
                <option value="B">Buffalo (B)</option>
                <option value="M">Mixed (M)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BiReset className="inline mr-1" /> Reset
            </button>

            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <FiSearch className="inline mr-1" /> Apply
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <MilkCollectionStats />

      {/* Collection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editMode ? "Edit Milk Collection" : "New Milk Collection"}
              </h3>
            </div>

            <MilkCollectionForm
              editMode={editMode}
              editId={editId}
              onClose={closeForm}
              farmerId={user?.id || "1001"}
            />
          </div>
        </div>
      )}

      {/* List of Collection Records */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Collection Records
        </h2>
        <MilkCollectionList onEdit={handleEdit} admin={isAdmin} />
      </div>
    </div>
  );
};

export default MPPDashboard;
