// This file provides type declarations for the Jest mock of AsyncStorage
import "@react-native-async-storage/async-storage";

// Extend the AsyncStorage type to include Jest mock methods
declare module "@react-native-async-storage/async-storage" {
  export interface AsyncStorageStatic {
    // Jest mock methods
    mockClear: () => void;
    mockReset: () => void;
    mockRestore: () => void;
    mockImplementation: (fn: () => any) => void;
    mockReturnValue: (value: any) => void;
    mockResolvedValue: (value: any) => void;
    mockRejectedValue: (error: Error | string) => void;
  }

  // Add mock methods to all AsyncStorage methods
  export interface AsyncStorageStatic {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    mergeItem: jest.Mock;
    clear: jest.Mock;
    getAllKeys: jest.Mock;
    flushGetRequests: jest.Mock;
    multiGet: jest.Mock;
    multiSet: jest.Mock;
    multiRemove: jest.Mock;
    multiMerge: jest.Mock;
  }
}
