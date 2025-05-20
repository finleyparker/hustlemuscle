export const getFirestore = jest.fn(() => ({}));

export const doc = jest.fn();
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ name: 'test' }) }));
export const setDoc = jest.fn(() => Promise.resolve());
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-id' }));
export const getDocs = jest.fn(() => Promise.resolve([]));
export const collection = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const updateDoc = jest.fn();
