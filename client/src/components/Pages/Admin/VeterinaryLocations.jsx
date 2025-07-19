import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { MapPin, Plus, Search, Edit, Trash2, Check, User } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Prepare green marker icon for map
const greenIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Location picker component - using functional component without prop validation
// since this is an internal component only used within this file
const LocationPicker = ({ initialPosition, onLocationChange }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const markerRef = useRef(null);

  // Handle map click events
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
    },
  });

  // Update the map view if position changes
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  // Handle marker drag events
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationChange(lat, lng);
        }
      },
    }),
    [onLocationChange]
  );

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={90}>
        <div className="text-center">
          <p className="font-semibold">Selected Location</p>
          <p className="text-xs">
            Lat: {position[0].toFixed(6)}
            <br />
            Lng: {position[1].toFixed(6)}
          </p>
          <p className="text-xs italic mt-1">Drag to adjust</p>
        </div>
      </Popup>
    </Marker>
  ) : (
    <div className="leaflet-control leaflet-control-custom">
      <div className="absolute top-2 left-2 z-[1000] bg-white p-2 rounded-md shadow-md">
        <p className="text-sm font-medium">
          Click on the map to set a location
        </p>
      </div>
    </div>
  );
};

const VeterinaryLocations = () => {
  // Remove debug logging
  // console.log('VeterinaryLocations component loaded');

  const [veterinarians, setVeterinarians] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India
  const [selectedVet, setSelectedVet] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    specialization: "",
    workingHours: "",
    services: "",
    latitude: "",
    longitude: "",
    rating: 0,
    doctorIds: [],
  });

  // Fetch veterinarians and doctors
  useEffect(() => {
    fetchVeterinarians();
    fetchDoctors();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/veterinarians`);
      const allData = Array.isArray(response.data) ? response.data : [];

      // Filter out records that are clearly doctors
      const locationRecords = allData.filter((record) => {
        // First check if type is explicitly set
        if (record.type === "location") return true;
        if (record.type === "doctor") return false;

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

        // Keep only those that don't look like doctors
        return !(hasDoctorFields || hasDefaultLocationFields);
      });

      setVeterinarians(locationRecords);
      setLoading(false);
    } catch (error) {
      // Replace console.error with silent error handling
      setError(
        `Failed to load veterinarians: ${
          error.message || "Unknown error"
        }. Please check your connection and try again.`
      );
      setLoading(false);
    }
  };

  // Fetch doctors for dropdown
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);

      // For now we'll use the same endpoint since we don't have a dedicated doctors endpoint
      const response = await axios.get(`${API_URL}/veterinarians`);
      const docsData = Array.isArray(response.data) ? response.data : [];

      // Filter doctors - identify records that have doctor-specific fields
      // A record is a doctor if it has qualification/experience OR it has defaults for location fields
      const filteredDoctors = docsData.filter((doc) => {
        const hasDoctorFields = Boolean(
          doc.qualification ||
            doc.experience ||
            doc.bio ||
            doc.availableDays ||
            doc.availableHours
        );

        const hasDefaultLocationFields = Boolean(
          doc.address === "N/A for doctors" ||
            (doc.latitude === 0 && doc.longitude === 0) ||
            doc.workingHours === "N/A for doctors"
        );

        const isDoctor = hasDoctorFields || hasDefaultLocationFields;
        return isDoctor;
      });

      setDoctors(filteredDoctors);
      setDoctorsLoading(false);
    } catch (error) {
      // Log error silently and use empty array as fallback
      console.error(
        "Error fetching doctors:",
        error.message || "Unknown error"
      );
      setDoctors([]);
      setDoctorsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle checkbox inputs through the onChange directly in the checkbox

    // Handle normal text inputs and other fields
    setFormData({
      ...formData,
      [name]:
        name === "services"
          ? value
          : name === "rating"
          ? parseFloat(value)
          : value,
    });
  };

  // Reset form and clear error state
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      specialization: "",
      workingHours: "",
      services: "",
      latitude: "",
      longitude: "",
      rating: 0,
      doctorIds: [],
    });
    setIsAdding(false);
    setIsEditing(false);
    setSelectedVet(null);
    setError(null);
  };

  // Validate form data
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.address ||
      !formData.phone ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("Please fill in all required fields marked with *");
      return false;
    }

    // Validate latitude and longitude
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setError(
        "Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values"
      );
      return false;
    }

    return true;
  };

  // Create new veterinarian
  const handleCreateVet = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare the data
      const vetData = {
        ...formData,
        // Explicitly set the record type
        type: "location",
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        // Ensure doctorIds is properly formatted for the API
        doctorIds: formData.doctorIds.length > 0 ? formData.doctorIds : null,
      };

      console.log("Creating location with data:", vetData);
      const response = await axios.post(`${API_URL}/veterinarians`, vetData);

      // Get doctor names for success message
      const doctorNames =
        formData.doctorIds.length > 0
          ? doctors
              .filter((doc) => formData.doctorIds.includes(doc._id))
              .map((doc) => doc.name)
          : [];

      setVeterinarians([...veterinarians, response.data]);

      // Show success message with doctor information if applicable
      const doctorMsg =
        formData.doctorIds.length > 0
          ? ` with ${formData.doctorIds.length} doctor${
              formData.doctorIds.length > 1 ? "s" : ""
            } (${doctorNames.join(", ")})`
          : "";

      // Use window.alert for simple notification
      window.alert(
        `Location "${formData.name}" created successfully${doctorMsg}`
      );

      resetForm();
      setLoading(false);
    } catch (error) {
      // Replace console.error with silent error handling
      setError(
        "Failed to create veterinarian. " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Update veterinarian
  const handleUpdateVet = async (e) => {
    e.preventDefault();
    if (!selectedVet) return;

    // Validate form first
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare the data
      const vetData = {
        ...formData,
        // Explicitly set the record type
        type: "location",
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      // If doctorIds is empty, set it to null
      if (vetData.doctorIds.length === 0) {
        vetData.doctorIds = null;
      }

      const response = await axios.put(
        `${API_URL}/veterinarians/${selectedVet._id}`,
        vetData
      );

      setVeterinarians(
        veterinarians.map((vet) =>
          vet._id === selectedVet._id ? response.data : vet
        )
      );

      resetForm();
      setLoading(false);
    } catch (error) {
      // Replace console.error with silent error handling
      setError(
        "Failed to update veterinarian. " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Delete veterinarian
  const handleDeleteVet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this veterinarian?"))
      return;

    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/veterinarians/${id}`);
      setVeterinarians(veterinarians.filter((vet) => vet._id !== id));
      setLoading(false);
    } catch (error) {
      // Handle error with message
      setError(
        `Failed to delete veterinarian: ${
          error.message || "Unknown error"
        }. Please try again later.`
      );
      setLoading(false);
    }
  };

  // Edit veterinarian
  const handleEditVet = (vet) => {
    setSelectedVet(vet);
    setError(null);
    setFormData({
      name: vet.name,
      address: vet.address,
      phone: vet.phone,
      specialization: vet.specialization || "",
      workingHours: vet.workingHours || "",
      services: Array.isArray(vet.services) ? vet.services.join(", ") : "",
      latitude: vet.latitude.toString(),
      longitude: vet.longitude.toString(),
      rating: vet.rating || 0,
      doctorIds: vet.doctorIds || [],
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add new veterinarian
  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
    setIsEditing(false);
  };

  // Filter veterinarians by search term
  const filteredVeterinarians = veterinarians.filter(
    (vet) =>
      vet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get doctor name by ID
  const getDoctorName = (doctorId) => {
    // Early return for empty doctorId
    if (!doctorId) return "No doctor assigned";

    // Check if the ID exists in our doctors array
    const doctor = doctors.find((doc) => doc._id === doctorId);

    if (doctor) {
      return doctor.name;
    } else {
      return "Doctor not found";
    }
  };

  // Fix misclassified records (simplified version)
  const handleFixRecord = (recordId) => {
    const record = veterinarians.find((v) => v._id === recordId);
    if (!record) return;

    try {
      setLoading(true);
      // Update UI immediately to prevent confusion
      setVeterinarians(veterinarians.filter((v) => v._id !== recordId));

      // Update the record on the server
      axios
        .put(`${API_URL}/veterinarians/${record._id}`, {
          ...record,
          type: "doctor",
        })
        .then(() => {
          // Refresh data after successful update
          fetchVeterinarians();
          fetchDoctors();
        })
        .catch((error) => {
          // Show error message
          setError(
            `Failed to fix record: ${
              error.message || "Unknown error"
            }. Please try again.`
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      // Catch any other errors in the outer try block
      console.error(
        "Error in handleFixRecord:",
        error.message || "Unknown error"
      );
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Veterinary Locations</h1>

        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search veterinarians..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Map view */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-[400px]">
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {veterinarians.map((vet) => {
              // Skip markers with invalid coordinates
              if (
                !vet.latitude ||
                !vet.longitude ||
                isNaN(parseFloat(vet.latitude)) ||
                isNaN(parseFloat(vet.longitude))
              ) {
                return null;
              }

              return (
                <Marker
                  key={vet._id}
                  position={[
                    parseFloat(vet.latitude),
                    parseFloat(vet.longitude),
                  ]}
                  icon={greenIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-green-700">{vet.name}</h3>
                      {vet.specialization && (
                        <p className="text-sm text-gray-600">
                          {vet.specialization}
                        </p>
                      )}
                      <p className="text-sm">📍 {vet.address}</p>
                      <p className="text-sm">📱 {vet.phone}</p>
                      {vet.workingHours && (
                        <p className="text-sm">⏰ {vet.workingHours}</p>
                      )}
                      {vet.rating > 0 && (
                        <p className="text-sm">⭐ {vet.rating}/5</p>
                      )}
                      <p className="text-sm mt-1 font-medium">
                        👨‍⚕️ {formData.doctorIds.map(getDoctorName).join(", ")}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Veterinary Center Form */}
      {(isAdding || isEditing) && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {isAdding
              ? "Add New Veterinary Location"
              : "Edit Veterinary Location"}
          </h2>

          <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p>Fields marked with * are required. Other fields are optional.</p>
          </div>

          <form
            onSubmit={isAdding ? handleCreateVet : handleUpdateVet}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-1" />
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                required
              ></textarea>
            </div>

            {/* Location Map Picker */}
            <div className="col-span-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Pick Location on Map *
              </label>
              <div className="h-[300px] w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <MapContainer
                  center={
                    formData.latitude && formData.longitude
                      ? [
                          parseFloat(formData.latitude),
                          parseFloat(formData.longitude),
                        ]
                      : mapCenter
                  }
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    initialPosition={
                      formData.latitude && formData.longitude
                        ? [
                            parseFloat(formData.latitude),
                            parseFloat(formData.longitude),
                          ]
                        : null
                    }
                    onLocationChange={(lat, lng) => {
                      setFormData({
                        ...formData,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      });
                    }}
                  />
                </MapContainer>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Click on the map to set location or drag the marker to adjust it
                precisely
              </p>
            </div>

            {/* Coordinates Fields */}
            <div className="col-span-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Doctors
              </label>
              <div className="border border-gray-300 rounded-lg p-2 max-h-60 overflow-y-auto">
                {doctorsLoading ? (
                  <div className="flex justify-center items-center h-16">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-600"></div>
                    <span className="ml-2 text-sm text-gray-500">
                      Loading doctors...
                    </span>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No doctors available
                  </div>
                ) : (
                  <>
                    <div className="mb-2 pb-2 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">
                          DOCTORS ({doctors.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected =
                              doctors.length === formData.doctorIds.length;
                            if (allSelected) {
                              // Deselect all
                              setFormData((prev) => ({
                                ...prev,
                                doctorIds: [],
                                // Keep existing specialization
                              }));
                            } else {
                              // Select all
                              const allDoctorIds = doctors.map(
                                (doc) => doc._id
                              );
                              const allSpecializations = [
                                ...new Set(
                                  doctors
                                    .map((doc) => doc.specialization)
                                    .filter(Boolean)
                                ),
                              ].join(", ");

                              setFormData((prev) => ({
                                ...prev,
                                doctorIds: allDoctorIds,
                                specialization:
                                  allSpecializations || prev.specialization,
                              }));
                            }
                          }}
                          className="text-xs text-amber-600 hover:text-amber-800"
                        >
                          {doctors.length === formData.doctorIds.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {doctors.map((doctor) => (
                        <div
                          key={doctor._id}
                          className="flex items-start py-1 hover:bg-amber-50 rounded px-1"
                        >
                          <input
                            type="checkbox"
                            id={`doctor-${doctor._id}`}
                            name="doctorIds"
                            value={doctor._id}
                            checked={formData.doctorIds.includes(doctor._id)}
                            onChange={(e) => {
                              const doctorId = e.target.value;
                              setFormData((prev) => {
                                const newDoctorIds = e.target.checked
                                  ? [...prev.doctorIds, doctorId]
                                  : prev.doctorIds.filter(
                                      (id) => id !== doctorId
                                    );

                                // Update specialization based on selected doctors
                                const selectedDoctors = doctors.filter((doc) =>
                                  [...newDoctorIds].includes(doc._id)
                                );

                                const combinedSpecialization =
                                  selectedDoctors.length > 0
                                    ? selectedDoctors
                                        .map((doc) => doc.specialization)
                                        .filter(Boolean)
                                        .join(", ")
                                    : prev.specialization;

                                return {
                                  ...prev,
                                  doctorIds: newDoctorIds,
                                  specialization:
                                    combinedSpecialization ||
                                    prev.specialization,
                                };
                              });
                            }}
                            className="h-4 w-4 mt-1 text-amber-600 focus:ring-amber-500 rounded"
                          />
                          <label
                            htmlFor={`doctor-${doctor._id}`}
                            className="ml-2 text-sm text-gray-700 flex-1 cursor-pointer"
                          >
                            <span className="font-medium">{doctor.name}</span>
                            {doctor.specialization && (
                              <span className="text-gray-500 ml-1">
                                - {doctor.specialization}
                              </span>
                            )}
                            {doctor.qualification && (
                              <div className="text-xs text-gray-500">
                                {doctor.qualification}
                                {doctor.experience &&
                                  ` • ${doctor.experience} experience`}
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {formData.doctorIds.length > 0 && !doctorsLoading && (
                <p className="mt-1 text-xs text-amber-600">
                  {formData.doctorIds.length} doctor(s) assigned to this
                  location
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.specialization}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours
              </label>
              <input
                type="text"
                name="workingHours"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.workingHours}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Services (comma separated)
              </label>
              <input
                type="text"
                name="services"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.services}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.rating}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-span-full flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {isAdding ? "Create" : "Update"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Veterinarians table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Location
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
                  Address
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
                  Assigned Doctors
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
              {loading && !veterinarians.length ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading veterinarians...
                  </td>
                </tr>
              ) : filteredVeterinarians.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No veterinarians found.
                  </td>
                </tr>
              ) : (
                filteredVeterinarians.map((vet) => (
                  <tr key={vet._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-amber-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {vet.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vet.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vet.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vet.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-amber-600 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formData.doctorIds.map(getDoctorName).join(", ")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVet(vet)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVet(vet._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Add fix button for potential doctor records */}
                        {(vet.qualification ||
                          vet.experience ||
                          vet.address === "N/A for doctors") && (
                          <button
                            onClick={() => handleFixRecord(vet._id)}
                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Fix record type - this appears to be a doctor entry"
                          >
                            Fix Type
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryLocations;
