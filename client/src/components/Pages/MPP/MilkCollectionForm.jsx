import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import useMPPStore from "../../../store/mppStore";
import { FiLoader, FiSave, FiX } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MilkCollectionForm = ({ editMode, editId, onClose, farmerId }) => {
  const {
    createMilkCollection,
    updateMilkCollection,
    fetchMilkCollection,
    fetchRate,
    fetchAvailableValues,
    validationErrors,
    isLoading,
    fetchMilkCollections,
  } = useMPPStore();

  // Form state
  const [formData, setFormData] = useState({
    farmerId: farmerId ? farmerId.toString() : "",
    collectionDate: format(new Date(), "yyyy-MM-dd"),
    shift: "morning",
    milkType: "C",
    fat: "",
    snf: "",
    quantity: "",
  });
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [calculatedRate, setCalculatedRate] = useState(0);
  const [availableValues, setAvailableValues] = useState({ fat: [], snf: [] });
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  // Load data for editing, available values, and farmers
  useEffect(() => {
    // Fetch available FAT and SNF values
    const loadAvailableValues = async () => {
      try {
        const values = await fetchAvailableValues();
        if (values && values.fat && values.snf) {
          setAvailableValues(values);
        } else {
          console.error("Invalid fat/snf values received:", values);
          // Set default empty arrays to prevent rendering issues
          setAvailableValues({ fat: [], snf: [] });
          toast.error("Failed to load fat and SNF values");
        }
      } catch (error) {
        console.error("Error loading fat/snf values:", error);
        setAvailableValues({ fat: [], snf: [] });
        toast.error("Failed to load fat and SNF values");
      }
    };

    // Fetch farmers list
    const loadFarmers = async () => {
      try {
        setLoadingFarmers(true);
        const response = await axios.get(`${API_URL}/admin/farmers`, {
          withCredentials: true,
        });
        if (response.data.status === "success") {
          setFarmers(response.data.data);
        } else {
          toast.error("Failed to load farmers list");
        }
      } catch (error) {
        console.error("Error loading farmers:", error);
        toast.error("Failed to load farmers list");
      } finally {
        setLoadingFarmers(false);
      }
    };

    loadAvailableValues();
    loadFarmers();

    // If in edit mode, fetch the collection record
    if (editMode && editId) {
      const fetchData = async () => {
        const collection = await fetchMilkCollection(editId);
        if (collection) {
          setFormData({
            farmerId: collection.farmerId.toString(),
            collectionDate: format(
              new Date(collection.collectionDate),
              "yyyy-MM-dd"
            ),
            shift: collection.shift,
            milkType: collection.milkType,
            fat: collection.fat.toString(),
            snf: collection.snf.toString(),
            quantity: collection.quantity.toString(),
          });
          setCalculatedRate(collection.rate);
          setCalculatedTotal(collection.totalAmount);
        }
      };
      fetchData();
    }
  }, [editMode, editId, fetchMilkCollection, fetchAvailableValues]);

  // Calculate total whenever fat, snf, or quantity changes
  const calculateTotal = async () => {
    const { fat, snf, quantity } = formData;
    if (fat && snf && quantity) {
      try {
        console.log(`Calculating rate for fat=${fat}, snf=${snf}`);
        const rate = await fetchRate(parseFloat(fat), parseFloat(snf));
        console.log(`Got rate: ${rate} for fat=${fat}, snf=${snf}`);
        setCalculatedRate(rate);
        setCalculatedTotal(rate * parseFloat(quantity));
      } catch (error) {
        console.error("Error calculating total:", error);
        toast.error("Failed to calculate rate. Please try again.");
      }
    }
  };

  // Update calculated values when form data changes
  useEffect(() => {
    if (formData.fat && formData.snf) {
      calculateTotal();
    }
  }, [formData.fat, formData.snf, formData.quantity]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);

    try {
      // Use the selected farmerId from the dropdown
      if (!formData.farmerId) {
        toast.error("Please select a farmer");
        return;
      }

      // Convert string values to appropriate types and validate they are valid numbers
      const submitData = {
        ...formData,
        farmerId: formData.farmerId,
        fat: parseFloat(formData.fat),
        snf: parseFloat(formData.snf),
        quantity: parseFloat(formData.quantity),
      };

      // Additional validation to check for NaN values
      if (
        isNaN(submitData.fat) ||
        isNaN(submitData.snf) ||
        isNaN(submitData.quantity)
      ) {
        console.error("Invalid numeric values in form data:", {
          fat: submitData.fat,
          snf: submitData.snf,
          quantity: submitData.quantity,
        });
        toast.error(
          "Please enter valid numeric values for Fat, SNF, and Quantity"
        );
        return;
      }

      console.log("Processed data for submission:", submitData);

      if (editMode) {
        console.log(`Updating milk collection ${editId} with:`, submitData);
        const result = await updateMilkCollection(editId, submitData);
        console.log("Update result:", result);
        if (result.success) {
          toast.success("Milk collection updated successfully");
          // Manually fetch the updated collections after successful update
          await fetchMilkCollections();
          onClose();
        } else if (result.errors) {
          console.error("Validation errors:", result.errors);
          // Display more specific validation errors
          const errorMessages = [];
          for (const field in result.errors) {
            if (result.errors[field]?._errors?.length) {
              errorMessages.push(
                `${field}: ${result.errors[field]._errors[0]}`
              );
            }
          }
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(", "));
          } else {
            toast.error("Please correct the errors in the form");
          }
        }
      } else {
        console.log("Creating new milk collection with:", submitData);
        const result = await createMilkCollection(submitData);
        console.log("Create result:", result);
        if (result.success) {
          toast.success("Milk collection added successfully");
          // Manually fetch the updated collections after successful creation
          await fetchMilkCollections();
          onClose();
        } else if (result.errors) {
          console.error("Validation errors:", result.errors);
          // Display more specific validation errors
          const errorMessages = [];
          for (const field in result.errors) {
            if (result.errors[field]?._errors?.length) {
              errorMessages.push(
                `${field}: ${result.errors[field]._errors[0]}`
              );
            }
          }
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(", "));
          } else {
            toast.error("Please correct the errors in the form");
          }
        } else if (result.error) {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Exception during form submission:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      toast.error(
        `Failed to save: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Helper to display validation errors
  const getFieldError = (fieldName) => {
    if (validationErrors && validationErrors[fieldName]?._errors) {
      return validationErrors[fieldName]._errors[0];
    }
    return null;
  };

  return (
    <div className="px-6 py-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Farmer ID */}
          <div>
            <label
              htmlFor="farmerId"
              className="block text-sm font-medium text-gray-700"
            >
              Farmer
            </label>
            <select
              id="farmerId"
              name="farmerId"
              value={formData.farmerId}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("farmerId") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
              disabled={loadingFarmers}
            >
              <option value="">Select Farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer._id} value={farmer._id}>
                  {farmer.name} (ID: {farmer._id})
                </option>
              ))}
            </select>
            {loadingFarmers && (
              <div className="mt-1 text-xs text-amber-600 flex items-center">
                <FiLoader className="animate-spin mr-1" />
                Loading farmers...
              </div>
            )}
            {getFieldError("farmerId") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("farmerId")}
              </p>
            )}
          </div>

          {/* Collection Date */}
          <div>
            <label
              htmlFor="collectionDate"
              className="block text-sm font-medium text-gray-700"
            >
              Collection Date
            </label>
            <input
              type="date"
              id="collectionDate"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("collectionDate")
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            />
            {getFieldError("collectionDate") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("collectionDate")}
              </p>
            )}
          </div>

          {/* Shift */}
          <div>
            <label
              htmlFor="shift"
              className="block text-sm font-medium text-gray-700"
            >
              Shift
            </label>
            <select
              id="shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("shift") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
            {getFieldError("shift") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("shift")}
              </p>
            )}
          </div>

          {/* Milk Type */}
          <div>
            <label
              htmlFor="milkType"
              className="block text-sm font-medium text-gray-700"
            >
              Milk Type
            </label>
            <select
              id="milkType"
              name="milkType"
              value={formData.milkType}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("milkType") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            >
              <option value="C">Cow (C)</option>
              <option value="B">Buffalo (B)</option>
              <option value="M">Mixed (M)</option>
            </select>
            {getFieldError("milkType") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("milkType")}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity (Liters)
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("quantity") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            />
            {getFieldError("quantity") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("quantity")}
              </p>
            )}
          </div>

          {/* Fat */}
          <div>
            <label
              htmlFor="fat"
              className="block text-sm font-medium text-gray-700"
            >
              Fat %
            </label>
            <select
              id="fat"
              name="fat"
              value={formData.fat}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("fat") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            >
              <option value="">Select Fat %</option>
              {availableValues.fat.map((fat) => (
                <option key={fat} value={fat}>
                  {fat}%
                </option>
              ))}
            </select>
            {getFieldError("fat") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("fat")}
              </p>
            )}
          </div>

          {/* SNF */}
          <div>
            <label
              htmlFor="snf"
              className="block text-sm font-medium text-gray-700"
            >
              SNF %
            </label>
            <select
              id="snf"
              name="snf"
              value={formData.snf}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                getFieldError("snf") ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              required
            >
              <option value="">Select SNF %</option>
              {availableValues.snf.map((snf) => (
                <option key={snf} value={snf}>
                  {snf}%
                </option>
              ))}
            </select>
            {getFieldError("snf") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("snf")}
              </p>
            )}
          </div>

          {/* Calculated Rate (Read-only) */}
          <div>
            <label
              htmlFor="rate"
              className="block text-sm font-medium text-gray-700"
            >
              Rate (₹/L)
            </label>
            <input
              type="text"
              id="rate"
              name="rate"
              value={calculatedRate.toFixed(2)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>

          {/* Calculated Total (Read-only) */}
          <div>
            <label
              htmlFor="total"
              className="block text-sm font-medium text-gray-700"
            >
              Total Amount (₹)
            </label>
            <input
              type="text"
              id="total"
              name="total"
              value={calculatedTotal.toFixed(2)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FiX className="inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {isLoading ? (
              <FiLoader className="inline mr-2 animate-spin" />
            ) : (
              <FiSave className="inline mr-2" />
            )}
            {editMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MilkCollectionForm;
