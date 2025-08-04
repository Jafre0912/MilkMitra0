// const express = require("express");
// const router = express.Router();
// const { 
//   getActiveAlerts, 
//   getAlertsBySeason, 
//   getAlertById, 
//   createAlert, 
//   updateAlert, 
//   deleteAlert 
// } = require("../controllers/seasonalAlertController");

// // Get all active alerts and create new alert
// router.route("/")
//   .get(getActiveAlerts)
//   .post(createAlert);

// // Get alerts by season
// router.route("/season/:season")
//   .get(getAlertsBySeason);

// // Get, update and delete alert by ID
// router.route("/:id")
//   .get(getAlertById)
//   .put(updateAlert)
//   .delete(deleteAlert);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getActiveAlerts,
  getAlertsBySeason,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAllAlerts
} = require("../controllers/seasonalAlertController");

// Get all alerts (active and inactive)
router.route("/all")
  .get(getAllAlerts);

// Get all active alerts and create new alert
router.route("/")
  .get(getActiveAlerts)
  .post(createAlert);

// Get alerts by season
router.route("/season/:season")
  .get(getAlertsBySeason);

// Get, update and delete alert by ID
router.route("/:id")
  .get(getAlertById)
  .put(updateAlert)
  .delete(deleteAlert);

module.exports = router;