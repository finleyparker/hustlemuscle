// jest.setup.js

// Polyfill for setImmediate
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
}

// Polyfill for clearImmediate
if (typeof global.clearImmediate === 'undefined') {
    global.clearImmediate = (handle) => clearTimeout(handle);
}

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: jest.fn(),
  },
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator',
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));
