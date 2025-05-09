// Setup file for Jest
import { Platform } from "react-native";
import "@testing-library/jest-native/extend-expect";

// Mock Platform
Platform.OS = "ios";
Platform.select = jest.fn().mockImplementation((obj) => {
  return obj.ios || obj.default;
});

// Mock for expo-device
jest.mock("expo-device", () => ({
  isDevice: true,
  manufacturer: "Apple",
  modelName: "iPhone 14",
  deviceName: "iPhone",
  deviceYearClass: 2022,
  totalMemory: 6144,
  osName: "iOS",
  osVersion: "16.0",
  osBuildId: "20A362",
  osInternalBuildId: "20A362",
}));

// Add Date.now mock to make tests more predictable
const FIXED_DATE = new Date("2025-05-08T12:00:00Z");
global.Date.now = jest.fn(() => FIXED_DATE.getTime());

// Create a mock for expo modules that might be imported directly
jest.mock("expo", () => ({
  isRunningInExpoGo: false,
  SplashScreen: {
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
  },
}));
