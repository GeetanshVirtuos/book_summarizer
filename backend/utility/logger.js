// ANSI color codes for terminal output
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  ORANGE: '\x1b[38;5;208m',
  RESET: '\x1b[0m'
};

// Log types
export const LOG_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFORMATION: 'information',
  WARNING: 'warning'
};

/**
 * Centralized logger function for the entire project
 * @param {string} text - The text to be logged
 * @param {string} type - The type of log (success or error)
 */
export function logger(text, type) {
  const timestamp = new Date().toISOString();
  
  switch(type) {
    case LOG_TYPES.SUCCESS:
      console.log(`${COLORS.GREEN}SUCCESS:${COLORS.RESET} ${text}`);
      break;
    
    case LOG_TYPES.ERROR:
      console.log(`${COLORS.RED}ERROR:${COLORS.RESET} ${text}`);
      break;
    
    case LOG_TYPES.INFORMATION:
      console.log(`${COLORS.ORANGE}INFORMATION:${COLORS.RESET} ${text}`);
      break;
    
    case LOG_TYPES.WARNING:
      console.log(`${COLORS.YELLOW}WARNING:${COLORS.RESET} ${text}`);
      break;
    
    default:
      console.log(`UNKNOWN LOG TYPE: ${text}`);
  }
}

logger('Logger initialized', LOG_TYPES.SUCCESS);
// logger('This is a test error message', LOG_TYPES.ERROR);
// logger('This is some informational message', LOG_TYPES.INFORMATION);
// logger('This is a warning message', LOG_TYPES.WARNING);

