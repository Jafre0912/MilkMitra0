require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/userSchema");

// Connection URI - use environment variable if available, otherwise use default local connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "dairyManagement";

console.log("Environment variables loaded:");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("DB_NAME:", process.env.DB_NAME);

console.log("Connecting to MongoDB...");
console.log(`Using MongoDB URI: ${MONGODB_URI}/${DB_NAME}`);

// Database connection function
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const createUser = async (userData) => {
  try {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);

      // Update role if specified and different
      if (role && existingUser.role !== role) {
        existingUser.role = role;
        await existingUser.save();
        console.log(`Updated existing user to ${role} role`);
      }
      return existingUser;
    } else {
      // Create new user
      const newUser = new User({
        name,
        email,
        password, // This will be hashed by the pre-save hook
        role: role || "user", // Default to user role if not specified
      });

      const savedUser = await newUser.save();
      console.log(`User ${name} created successfully`);
      return savedUser;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const createAdminUser = async () => {
  try {
    await connectDB(); // Connect to the database first

    const adminData = {
      name: "Admin User",
      email: "admin@farmflow.com",
      password: "admin123",
      role: "admin",
    };

    await createUser(adminData);

    console.log("Admin credentials:");
    console.log("Email: admin@farmflow.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error in admin creation process:", error);
  }
};

// Execute as standalone script if directly called
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log("Script completed successfully");
      // Don't exit immediately to allow async operations to complete
      setTimeout(() => process.exit(0), 1000);
    })
    .catch((err) => {
      console.error("Script failed:", err);
      process.exit(1);
    });
}

// Export both functions for use in other modules
module.exports = {
  connectDB,
  createUser,
};
