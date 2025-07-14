
// Function to get current timestamp in a readable format
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

export const logger = {
  info: (message, context = {}) => {
    console.info(`[INFO] ${getTimestamp()} - ${message}`, context);
  },
  warn: (message, context = {}) => {
    console.warn(`[WARN] ${getTimestamp()} - ${message}`, context);
  },
  error: (message, context = {}) => {
    console.error(`[ERROR] ${getTimestamp()} - ${message}`, context);
  },
  debug: (message, context = {}) => {
    // k6's console.debug only shows up if K6_LOG_LEVEL=debug
    console.debug(`[DEBUG] ${getTimestamp()} - ${message}`, context);
  },
  
  apiCall: (method, url, details = {}) => {
    logger.debug(`API Call: ${method} ${url}`, details);
  },
  checkResult: (description, success, details = {}) => {
    if (success) {
      logger.info(`Check PASSED: ${description}`, details);
    } else {
      logger.error(`Check FAILED: ${description}`, details);
    }
  }
};