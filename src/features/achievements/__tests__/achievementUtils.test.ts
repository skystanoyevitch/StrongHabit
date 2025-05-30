import {
  checkAchievements,
  getConsistentTimePeriod,
} from "../achievementUtils";
import { Habit } from "../../../types/habit";
import { ACHIEVEMENTS } from "../achievementList";

describe("Achievement Utilities", () => {
  const createBaseHabit = (): Habit => ({
    id: "1",
    name: "Test Habit",
    description: "Test Description",
    color: "#FF0000",
    frequency: "daily",
    createdAt: "2023-01-01T00:00:00.000Z",
    startDate: "2023-01-01",
    streak: 0,
    completionLogs: [],
    reminderEnabled: false,
  });

  describe("checkAchievements", () => {
    test("should unlock streak achievements", () => {
      // Create habit with a streak of 7
      const habit = {
        ...createBaseHabit(),
        streak: 7,
      };

      const unlockedAchievements = checkAchievements(habit);

      // Should unlock the 3-day and 7-day streak achievements
      expect(unlockedAchievements.length).toBe(2);
      expect(unlockedAchievements.some((a) => a.id === "streak-3")).toBe(true);
      expect(unlockedAchievements.some((a) => a.id === "streak-7")).toBe(true);
      expect(unlockedAchievements.every((a) => a.unlockedAt)).toBe(true);
    });

    test("should unlock completion achievements", () => {
      // Create habit with 25 completed logs
      const habit = {
        ...createBaseHabit(),
        completionLogs: Array(25)
          .fill(0)
          .map((_, i) => ({
            date: new Date(2023, 0, i + 1).toISOString(),
            completed: true,
          })),
      };

      const unlockedAchievements = checkAchievements(habit);

      // Should unlock the 10-completion and 25-completion achievements
      expect(unlockedAchievements.some((a) => a.id === "completion-10")).toBe(
        true
      );
      expect(unlockedAchievements.some((a) => a.id === "completion-25")).toBe(
        true
      );
    });

    test("should handle consistency achievements", () => {
      // Create habit with completions at the same hour for multiple days
      const habit = {
        ...createBaseHabit(),
        completionLogs: Array(5)
          .fill(0)
          .map((_, i) => ({
            date: new Date(2023, 0, i + 1, 8, 0, 0).toISOString(), // 8:00 AM each day
            completed: true,
          })),
      };

      const unlockedAchievements = checkAchievements(habit);

      // Should unlock the 5-day consistency achievement
      expect(unlockedAchievements.some((a) => a.id === "consistency-5")).toBe(
        true
      );
    });
    test("should not unlock achievements that have not been reached", () => {
      // Create habit with minimal data
      const habit = {
        ...createBaseHabit(),
        streak: 2, // Not enough for streak-3
        completionLogs: Array(5)
          .fill(0)
          .map((_, i) => ({
            date: new Date(2023, 0, i + 1).toISOString(),
            completed: true,
          })),
      };

      const unlockedAchievements = checkAchievements(habit);

      // Should not unlock the streak-3 achievement since streak is only 2
      expect(unlockedAchievements.every((a) => a.id !== "streak-3")).toBe(true);
      // No completion-5 achievement exists, but should have some unlocked achievements
      expect(unlockedAchievements.length).toBeGreaterThan(0);
    });
  });

  describe("getConsistentTimePeriod", () => {
    test("should calculate consistent time periods correctly", () => {
      const logs = [
        { date: new Date(2023, 0, 1, 8, 0, 0).toISOString(), completed: true },
        { date: new Date(2023, 0, 2, 8, 0, 0).toISOString(), completed: true },
        { date: new Date(2023, 0, 3, 8, 0, 0).toISOString(), completed: true },
        { date: new Date(2023, 0, 4, 9, 0, 0).toISOString(), completed: true }, // Different hour
        { date: new Date(2023, 0, 5, 8, 0, 0).toISOString(), completed: true },
      ];

      // Use internal function to test (export this in achievementUtils.ts)
      const period = getConsistentTimePeriod(logs);

      // The maximum consistent time period should be 3 (first three entries)
      expect(period).toBe(3);
    });

    test("should handle empty logs", () => {
      const period = getConsistentTimePeriod([]);
      expect(period).toBe(0);
    });
  });
});
