// Mock for AsyncStorage
const mockStorage = {};

const AsyncStorage = {
  getItem: jest.fn((key) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => {
      delete mockStorage[key];
    });
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),
  multiGet: jest.fn((keys) => {
    const results = keys.map((key) => [key, mockStorage[key] || null]);
    return Promise.resolve(results);
  }),
  multiSet: jest.fn((keyValuePairs) => {
    keyValuePairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach((key) => {
      delete mockStorage[key];
    });
    return Promise.resolve();
  }),
  mergeItem: jest.fn((key, value) => {
    const existingValue = mockStorage[key] ? JSON.parse(mockStorage[key]) : {};
    const newValue = JSON.parse(value);
    mockStorage[key] = JSON.stringify({ ...existingValue, ...newValue });
    return Promise.resolve();
  }),
  flushGetRequests: jest.fn(),
};

export default AsyncStorage;
