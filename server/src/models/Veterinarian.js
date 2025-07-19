const mongoose = require("mongoose");

const veterinarianSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["doctor", "location"],
      default: function () {
        // Default to 'doctor' if has doctor-specific fields, otherwise 'location'
        return this.qualification || this.experience ? "doctor" : "location";
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: function () {
        // Only required for location type entries (not doctors)
        return this.type === "location";
      },
    },
    phone: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: false,
    },
    latitude: {
      type: Number,
      required: function () {
        // Only required for location type entries (not doctors)
        return this.type === "location";
      },
    },
    longitude: {
      type: Number,
      required: function () {
        // Only required for location type entries (not doctors)
        return this.type === "location";
      },
    },
    services: [
      {
        type: String,
      },
    ],
    workingHours: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Veterinarian",
      required: false,
    },
    // Array of doctor IDs for locations that have multiple doctors
    doctorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Veterinarian",
      },
    ],
    // Doctor-specific fields
    qualification: {
      type: String,
      required: function () {
        return this.type === "doctor";
      },
    },
    experience: {
      type: String,
      required: function () {
        return this.type === "doctor";
      },
    },
    availableDays: {
      type: String,
      required: false,
    },
    availableHours: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: function () {
        return this.type === "doctor";
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add a pre-save hook to validate based on the type of entry
veterinarianSchema.pre("validate", function (next) {
  // Set the type based on fields
  if (
    this.qualification ||
    this.experience ||
    (this.availableDays && this.availableHours) ||
    this.bio
  ) {
    this.type = "doctor";
  } else {
    this.type = "location";
  }

  // Log for debugging
  console.log("Pre-validate hook. Record type:", this.type);

  // If it's a doctor entry, the location fields are not required
  if (this.type === "doctor") {
    // Set default values for required fields that aren't needed for doctors
    if (!this.address) this.address = "N/A for doctors";
    if (!this.latitude) this.latitude = 0;
    if (!this.longitude) this.longitude = 0;
    if (!this.workingHours)
      this.workingHours = this.availableHours || "N/A for doctors";
  }

  // If it's a location entry, ensure doctorIds field is properly handled
  if (
    this.type === "location" &&
    this.doctorIds &&
    Array.isArray(this.doctorIds)
  ) {
    // Filter out any empty or invalid doctor IDs
    this.doctorIds = this.doctorIds.filter(
      (id) => id && mongoose.Types.ObjectId.isValid(id)
    );

    // If there are no valid doctorIds, set to undefined so it won't be stored
    if (this.doctorIds.length === 0) {
      this.doctorIds = undefined;
    }

    // For backward compatibility - if there's a single doctorId, ensure it's also in doctorIds
    if (this.doctorId && !this.doctorIds.includes(this.doctorId)) {
      this.doctorIds.push(this.doctorId);
    }
  }

  next();
});

// Method to get all doctors for a location
veterinarianSchema.methods.getDoctors = async function () {
  try {
    // Skip if this is a doctor record
    if (this.type === "doctor") return [];

    // If there's no doctorIds array or it's empty, return an empty array
    if (!this.doctorIds || !this.doctorIds.length) return [];

    // Populate and return all assigned doctors
    const populatedLocation = await this.constructor
      .findById(this._id)
      .populate(
        "doctorIds",
        "name specialization qualification experience email phone availableDays availableHours bio"
      )
      .exec();

    return populatedLocation.doctorIds || [];
  } catch (error) {
    console.error("Error fetching doctors for location:", error);
    return [];
  }
};

const Veterinarian = mongoose.model("Veterinarian", veterinarianSchema);

module.exports = Veterinarian;
