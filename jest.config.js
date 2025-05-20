module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '@testing-library/jest-native/extend-expect',
    ],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?@?react-native|@react-navigation|expo|firebase|@firebase)',
    ],
    moduleNameMapper: {
        // Only mock if you created these files
        '^@react-native-firebase/app$': '<rootDir>/__mocks__/@react-native-firebase/app.js',
        '^@react-native-firebase/auth$': '<rootDir>/__mocks__/@react-native-firebase/auth.js',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'jsdom',
};
