// Re-export the auth.js module to maintain backward compatibility
const authMiddleware = require("./auth");

module.exports = authMiddleware;
