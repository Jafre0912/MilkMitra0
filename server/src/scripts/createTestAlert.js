require("dotenv").config();
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const NewsAlert = require("../models/NewsAlert");

async function createTestAlert() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create a test user ID (this would normally be a valid user ID from your database)
    const testUserId = new ObjectId();

    // Create test news alert
    const testAlert = new NewsAlert({
      title: "Test News Alert",
      content:
        "This is a test news alert for debugging purposes. If you see this, the system is working correctly!",
      category: "general",
      severity: "medium",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      createdBy: testUserId, // Required field
    });

    // Save to database
    const savedAlert = await testAlert.save();
    console.log("Test alert created successfully:", savedAlert);

    // Create a second alert with different category
    const secondAlert = new NewsAlert({
      title: "Disease Alert: Cattle Preventative Measures",
      content:
        "Recent reports indicate increased risk of foot and mouth disease in the region. Please ensure all cattle are vaccinated and implement biosecurity measures.",
      category: "disease_outbreak",
      severity: "high",
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      isActive: true,
      createdBy: testUserId,
    });

    const savedSecondAlert = await secondAlert.save();
    console.log("Second alert created successfully:", savedSecondAlert);
  } catch (error) {
    console.error("Error creating test alert:", error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
createTestAlert();
