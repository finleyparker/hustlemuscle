// jest.setup.js

// Polyfill for setImmediate
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
}

// Polyfill for clearImmediate
if (typeof global.clearImmediate === 'undefined') {
    global.clearImmediate = (handle) => clearTimeout(handle);
}
