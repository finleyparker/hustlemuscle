// jest.setup.js

import '@testing-library/jest-native';

// Polyfill for setImmediate
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
}

// Polyfill for clearImmediate
if (typeof global.clearImmediate === 'undefined') {
    global.clearImmediate = (handle) => clearTimeout(handle);
}

// Mock timers
jest.useFakeTimers();

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
  Alert: {
    alert: jest.fn(),
  },
  Image: 'Image',
}));

// Mock Expo components
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock date picker
jest.mock('react-native-modal-datetime-picker', () => ({
  __esModule: true,
  default: 'DateTimePickerModal',
}));
