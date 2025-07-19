const rateLimit = require("express-rate-limit");

// Disabled rate limiting temporarily
const authLimiter = (req, res, next) => {
  // Rate limiting has been disabled
  console.log("Rate limiting is disabled");
  next();
};

// Original implementation (commented out)
/*
const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 5, // 5 attempts
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
});
*/

module.exports = { authLimiter };
