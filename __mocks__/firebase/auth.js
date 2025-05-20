export const getAuth = jest.fn(() => ({
    currentUser: { uid: 'test-user-id' },
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  }));
  