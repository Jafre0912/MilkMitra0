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
import { FaTimes, FaPlus } from "react-icons/fa";
import useMPPStore from "../../../store/mppStore";
import MilkCollectionForm from "../MPP/MilkCollectionForm";
import MilkCollectionList from "../MPP/MilkCollectionList";
import MilkCollectionStats from "../MPP/MilkCollectionStats";

const AdminMilkCollection = () => {
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
  const [farmerIdFilter, setFarmerIdFilter] = useState("");

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
    if (farmerIdFilter) {
      setFilters({ farmerId: farmerIdFilter });
    }
    fetchMilkCollections();
    fetchStats();
    fetchShiftStats();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFarmerIdFilter("");
    clearFilters();
    fetchMilkCollections();
    fetchStats();
    fetchShiftStats();
    setShowFilters(false);
  };

  // Open form for new entry
  const handleAddNew = () => {
    setEditMode(false);
    setEditId(null);
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (id) => {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchMilkCollections}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-semibold text-amber-800 mb-4 sm:mb-0">
          Milk Collection Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
          >
            <FaPlus className="mr-2" />
            New Collection
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-amber-50 p-4 rounded-md shadow-sm mb-6 border border-amber-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-amber-800">
              Filter Options
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-amber-500 hover:text-amber-700"
            >
              <FaTimes />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-amber-700 mb-1"
              >
                <FiCalendar className="inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-amber-700 mb-1"
              >
                <FiCalendar className="inline mr-1" /> End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="farmerId"
                className="block text-sm font-medium text-amber-700 mb-1"
              >
                <FiSearch className="inline mr-1" /> Farmer ID
              </label>
              <input
                type="text"
                id="farmerId"
                name="farmerId"
                value={farmerIdFilter}
                onChange={(e) => setFarmerIdFilter(e.target.value)}
                placeholder="Enter Farmer ID"
                className="block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="shift"
                className="block text-sm font-medium text-amber-700 mb-1"
              >
                Shift
              </label>
              <select
                id="shift"
                name="shift"
                value={filters.shift || ""}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="">All Shifts</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <BiReset className="inline mr-1" />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FiSearch className="inline mr-1" />
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <MilkCollectionStats />

      {/* Collection List */}
      <div className="mt-6">
        <MilkCollectionList onEdit={handleEdit} admin={true} />
      </div>

      {/* Collection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-amber-200 flex justify-between items-center bg-amber-50">
              <h2 className="text-xl font-semibold text-amber-800">
                {editMode ? "Edit Milk Collection" : "New Milk Collection"}
              </h2>
              <button
                onClick={closeForm}
                className="text-amber-500 hover:text-amber-700"
              >
                <FaTimes />
              </button>
            </div>
            <MilkCollectionForm
              editMode={editMode}
              editId={editId}
              onClose={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMilkCollection;
