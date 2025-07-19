/**
 * Wrapper for async functions to avoid try-catch blocks
 * @param {Function} fn - Async function to be wrapped
 * @returns {Function} - Express middleware function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync; 