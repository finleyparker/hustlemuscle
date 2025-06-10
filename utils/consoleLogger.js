import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSOLE_LOGGING_KEY = '@console_logging_enabled';

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

let isConsoleEnabled = false;

export const getConsoleLoggingState = async () => {
  try {
    const value = await AsyncStorage.getItem(CONSOLE_LOGGING_KEY);
    isConsoleEnabled = value === 'true';
    updateConsoleMethods();
    return isConsoleEnabled;
  } catch (error) {
    originalConsole.error('Error reading console logging state:', error);
    return false;
  }
};

export const setConsoleLoggingState = async (enabled) => {
  try {
    await AsyncStorage.setItem(CONSOLE_LOGGING_KEY, enabled.toString());
    isConsoleEnabled = enabled;
    updateConsoleMethods();
    return true;
  } catch (error) {
    originalConsole.error('Error saving console logging state:', error);
    return false;
  }
};

const updateConsoleMethods = () => {
  if (isConsoleEnabled) {
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  } else {
    // Override console methods with no-ops
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
  }
};

// Initialize console state on import
getConsoleLoggingState(); 