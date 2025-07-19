import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Plus, Search, Edit, Trash2, Check, X } from "lucide-react";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VeterinaryDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    availableDays: "",
    availableHours: "",
    bio: "",
  });

  // Fetch veterinary doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Using the same API endpoint as locations for now
      const response = await axios.get(`${API_URL}/veterinarians`);
      const allData = Array.isArray(response.data) ? response.data : [];

      console.log("All veterinarian data:", allData);

      // Filter for doctor records only
      const doctorRecords = allData.filter((record) => {
        // First check if type is explicitly set
        if (record.type === "doctor") return true;
        if (record.type === "location") return false;

        // Fallback to checking fields for older records without type
        const hasDoctorFields = Boolean(
          record.qualification ||
            record.experience ||
            record.bio ||
            record.availableDays ||
            record.availableHours
        );

        const hasDefaultLocationFields = Boolean(
          record.address === "N/A for doctors" ||
            (record.latitude === 0 &&
              record.longitude === 0 &&
              record.address) ||
            record.workingHours === "N/A for doctors"
        );

        return hasDoctorFields || hasDefaultLocationFields;
      });

      console.log("Filtered doctor records:", doctorRecords);

      setDoctors(doctorRecords);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching veterinary doctors:", error);
      setError("Failed to load veterinary doctors.");
      setLoading(false);
      setDoctors([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      qualification: "",
      experience: "",
      availableDays: "",
      availableHours: "",
      bio: "",
    });
    setIsAdding(false);
    setIsEditing(false);
    setSelectedDoctor(null);
  };

  // Create new doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create a complete doctor record with both required and doctor-specific fields
      const doctorData = {
        ...formData,
        // Explicitly set the record type
        type: "doctor",
        // These fields will be filled with default values by the pre-validate hook
        // but we provide them here to be explicit
        latitude: 0,
        longitude: 0,
        address: "N/A for doctors",
        workingHours: formData.availableHours || "N/A for doctors",
      };

      // Validate the required doctor fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.email ||
        !formData.specialization ||
        !formData.qualification ||
        !formData.experience
      ) {
        setError("Please fill in all required fields (marked with *)");
        setLoading(false);
        return;
      }

      console.log("Creating doctor with data:", doctorData);

      // Using the veterinarians endpoint
      const response = await axios.post(`${API_URL}/veterinarians`, doctorData);
      console.log("Server response:", response.data);

      setDoctors([...doctors, response.data]);
      resetForm();
      setLoading(false);
    } catch (error) {
      console.error("Error creating veterinary doctor:", error);
      setError(
        "Failed to create doctor. " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Update doctor
  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      setLoading(true);

      // Create a complete doctor record with both required and doctor-specific fields
      const doctorData = {
        ...formData,
        // Explicitly set the record type
        type: "doctor",
        // These fields will be filled with default values by the pre-validate hook
        // but we provide them here to be explicit
        latitude: selectedDoctor.latitude || 0,
        longitude: selectedDoctor.longitude || 0,
        address: selectedDoctor.address || "N/A for doctors",
        workingHours:
          formData.availableHours ||
          selectedDoctor.workingHours ||
          "N/A for doctors",
      };

      // Validate the required doctor fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.email ||
        !formData.specialization ||
        !formData.qualification ||
        !formData.experience
      ) {
        setError("Please fill in all required fields (marked with *)");
        setLoading(false);
        return;
      }

      console.log("Updating doctor with ID:", selectedDoctor._id);
      console.log("Update data:", doctorData);

      const response = await axios.put(
        `${API_URL}/veterinarians/${selectedDoctor._id}`,
        doctorData
      );
      console.log("Server response:", response.data);

      setDoctors(
        doctors.map((doc) =>
          doc._id === selectedDoctor._id ? response.data : doc
        )
      );

      resetForm();
      setLoading(false);
    } catch (error) {
      console.error("Error updating veterinary doctor:", error);
      setError(
        "Failed to update doctor. " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this veterinary doctor?")
    )
      return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/veterinarians/${id}`);
      setDoctors(doctors.filter((doc) => doc._id !== id));
      setLoading(false);
    } catch (error) {
      console.error("Error deleting veterinary doctor:", error);
      setError("Failed to delete doctor.");
      setLoading(false);
    }
  };

  // Edit doctor
  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      availableDays: doctor.availableDays || "",
      availableHours: doctor.availableHours || "",
      bio: doctor.bio || "",
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add new doctor
  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
    setIsEditing(false);
  };

  // Filter doctors by search term
  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Veterinary Doctors</h1>

        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialization..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || isEditing) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isAdding ? "Add New Veterinary Doctor" : "Edit Veterinary Doctor"}
          </h2>

          <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p>Fields marked with * are required. Other fields are optional.</p>
          </div>

          <form onSubmit={isAdding ? handleCreateDoctor : handleUpdateDoctor}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience *
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Days
                </label>
                <input
                  type="text"
                  name="availableDays"
                  value={formData.availableDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Hours
                </label>
                <input
                  type="text"
                  name="availableHours"
                  value={formData.availableHours}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio/Description
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>{isAdding ? "Add Doctor" : "Update Doctor"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors List Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Doctor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Specialization
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Qualification
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Availability
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !doctors.length ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading doctors...
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No veterinary doctors found.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-amber-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.experience} experience
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.qualification}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doctor.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doctor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doctor.availableDays}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doctor.availableHours}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default VeterinaryDoctors;
