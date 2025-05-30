import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService } from "../storage";
import { Habit } from "../../types/habit";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");

// Cast AsyncStorage methods as jest.Mock to use mock functions
const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

// Mock notifications
jest.mock("../notifications", () => ({
  scheduleHabitReminder: jest.fn(),
  cancelHabitReminder: jest.fn(),
}));

// Mock dateUtils to avoid timezone issues in tests
jest.mock("../dateUtils", () => ({
  getTodayDateString: jest.fn().mockImplementation(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }),
  getYesterdayDateString: jest.fn().mockImplementation(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }),
}));

describe("StorageService", () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItem.mockClear();
    mockedSetItem.mockClear();
  });

  // Initialize service before each test
  let service: StorageService;

  beforeEach(() => {
    service = StorageService.getInstance();
  });

  describe("streak calculation", () => {
    it("should calculate streak correctly for consecutive days", async () => {
      // Create a habit with a sequence of completions
      const habit: Habit = {
        id: "1",
        name: "Test Habit",
        description: "Description",
        color: "#FF0000",
        frequency: "daily",
        createdAt: "2023-01-01T00:00:00.000Z",
        startDate: "2023-01-01",
        streak: 0,
        completionLogs: [],
        reminderEnabled: false,
      };

      // Setup storage mock for the test
      mockedGetItem.mockResolvedValue(
        JSON.stringify({
          habits: [habit],
          lastUpdated: new Date().toISOString(),
          version: 1,
        })
      );

      // Mock today and get date strings for previous days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

      // Update completion for three consecutive days
      await service.updateHabitCompletion("1", twoDaysAgoStr, true);
      await service.updateHabitCompletion("1", yesterdayStr, true);
      await service.updateHabitCompletion("1", todayStr, true);

      // Get the updated habit
      const habits = await service.getHabits();
      const updatedHabit = habits.find((h) => h.id === "1");

      // Check if streak is 3
      expect(updatedHabit?.streak).toBe(3);
    });

    it("should reset streak when a day is missed", async () => {
      // Create a habit with a sequence of completions
      const habit: Habit = {
        id: "1",
        name: "Test Habit",
        description: "Description",
        color: "#FF0000",
        frequency: "daily",
        createdAt: "2023-01-01T00:00:00.000Z",
        startDate: "2023-01-01",
        streak: 0,
        completionLogs: [],
        reminderEnabled: false,
      };

      // Setup storage mock for the test
      mockedGetItem.mockResolvedValue(
        JSON.stringify({
          habits: [habit],
          lastUpdated: new Date().toISOString(),
          version: 1,
        })
      );

      // Mock dates
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const todayStr = today.toISOString().split("T")[0];
      const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];
      const fourDaysAgoStr = fourDaysAgo.toISOString().split("T")[0];

      // Complete today and 3-4 days ago, skipping yesterday
      await service.updateHabitCompletion("1", fourDaysAgoStr, true);
      await service.updateHabitCompletion("1", threeDaysAgoStr, true);
      await service.updateHabitCompletion("1", todayStr, true);

      // Get the updated habit
      const habits = await service.getHabits();
      const updatedHabit = habits.find((h) => h.id === "1");

      // Check if streak is 1 (just today)
      expect(updatedHabit?.streak).toBe(1);
    });

    it("should handle missing completions correctly", async () => {
      // Create a habit with no completions
      const habit: Habit = {
        id: "1",
        name: "Test Habit",
        description: "Description",
        color: "#FF0000",
        frequency: "daily",
        createdAt: "2023-01-01T00:00:00.000Z",
        startDate: "2023-01-01",
        streak: 0,
        completionLogs: [],
        reminderEnabled: false,
      };

      // Setup storage mock for the test
      mockedGetItem.mockResolvedValue(
        JSON.stringify({
          habits: [habit],
          lastUpdated: new Date().toISOString(),
          version: 1,
        })
      );

      // Get the habit
      const habits = await service.getHabits();
      const testHabit = habits.find((h) => h.id === "1");

      // Streak should be 0
      expect(testHabit?.streak).toBe(0);
    });
  });
});
