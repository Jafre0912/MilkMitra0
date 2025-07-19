/**
 * Standard error handler for API responses
 * @param {Error} error - The error object
 * @param {Response} res - Express response object
 * @returns {Response} Error response
 */
exports.errorHandler = (error, res) => {
  console.error("API Error:", error);

  // Check for Mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors,
    });
  }

  // Check for Mongoose cast errors (invalid ID format)
  if (error.name === "CastError") {
    return res.status(400).json({
      status: "fail",
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  // Check for duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      status: "fail",
      message: `Duplicate field value: ${field}. Please use another value.`,
    });
  }

  // Check for JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Your token has expired. Please log in again.",
    });
  }

  // Default error response
  return res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message || "Something went wrong",
  });
};
