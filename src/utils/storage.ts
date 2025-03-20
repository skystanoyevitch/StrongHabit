import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, HabitLog } from "../types/habit";
import { scheduleHabitReminder, cancelHabitReminder } from "./notifications";

const STORAGE_KEY = "HABITFLOW_DATA_V1";

interface StorageData {
  habits: Habit[];
  lastUpdated: string;
  version: number;
}

export class StorageService {
  private static instance: StorageService;
  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize storage with default data
  async initialize(): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingData) {
        const initialData: StorageData = {
          habits: [],
          lastUpdated: new Date().toISOString(),
          version: 1,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Storage initialization failed:", error);
      throw new Error("Failed to initialize storage");
    }
  }

  // Add this method to the StorageService class
  async updateHabitCompletion(
    habitId: string,
    date: string,
    completed: boolean
  ): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) throw new Error("No storage data found");

      const storageData: StorageData = JSON.parse(data);
      const habitIndex = storageData.habits.findIndex((h) => h.id === habitId);

      if (habitIndex === -1) throw new Error("Habit not found");

      const habit = storageData.habits[habitIndex];

      // Find if there's already a log for today
      const logIndex = habit.completionLogs.findIndex(
        (log) => log.date.split("T")[0] === date
      );

      if (logIndex >= 0) {
        // Update existing log
        habit.completionLogs[logIndex].completed = completed;
      } else {
        // Add new log for today
        habit.completionLogs.push({
          date: new Date(date).toISOString(),
          completed,
        });
      }

      // Update streak count
      this.updateStreak(habit);

      // Save updated data
      storageData.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Failed to update habit completion:", error);
      throw new Error("Failed to update habit completion");
    }
  }

  // // In StorageService class
  // // Add this temporary test method
  // async simulatePriorCompletion(
  //   habitId: string,
  //   daysAgo: number
  // ): Promise<void> {
  //   const date = new Date();
  //   date.setDate(date.getDate() - daysAgo);
  //   const dateStr = date.toISOString().split("T")[0];
  //   return this.updateHabitCompletion(habitId, dateStr, true);
  // }

  // Helper method to update streak (add this to the StorageService class)
  private updateStreak(habit: Habit): void {
    if (habit.completionLogs.length === 0) {
      habit.streak = 0;
      return;
    }

    // Sort logs by date, most recent first
    const sortedLogs = [...habit.completionLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get current date without time
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Check if the most recent log is from today or yesterday and was completed
    const mostRecentLog = sortedLogs[0];
    const mostRecentDate = mostRecentLog.date.split("T")[0];

    if (!mostRecentLog.completed) {
      habit.streak = 0;
      return;
    }

    // If most recent is today, count backward from yesterday
    // If most recent is before today, count backward from most recent
    let currentDate = mostRecentDate === today ? yesterday : mostRecentDate;
    let streak = mostRecentLog.completed ? 1 : 0;

    // Count consecutive completed days
    for (let i = 1; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      const logDate = log.date.split("T")[0];

      // Check if this log is from the previous day
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedDateStr = expectedDate.toISOString().split("T")[0];

      if (logDate === expectedDateStr && log.completed) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    habit.streak = streak;
  }

  // Get all habits
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsedData: StorageData = JSON.parse(data);
      return parsedData.habits;
    } catch (error) {
      console.error("Failed to get habits:", error);
      throw new Error("Failed to retrieve habits");
    }
  }

  private validateHabit(habit: Partial<Habit>): void {
    if (!habit.name || habit.name.trim().length === 0) {
      throw new Error("Habit name is required");
    }

    // if (!habit.description || habit.description.trim().length === 0) {
    //   throw new Error("Habit description is required");
    // }

    if (
      !habit.frequency ||
      !["daily", "weekly", "monthly"].includes(habit.frequency)
    ) {
      throw new Error("Invalid habit frequency");
    }
  }

  // Add new habit
  async addHabit(
    habit: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
  ): Promise<Habit> {
    try {
      this.validateHabit(habit);

      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const storageData: StorageData = data
        ? JSON.parse(data)
        : { habits: [], lastUpdated: new Date().toISOString(), version: 1 };

      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        streak: 0,
        completionLogs: [],
      };

      // Schedule reminder if enabled
      if (habit.reminderEnabled && habit.reminderTime) {
        const [hours, minutes] = habit.reminderTime.split(":").map(Number);

        // Schedule the reminder
        const notificationId = await scheduleHabitReminder({
          habitId: newHabit.id,
          title: `Reminder: ${habit.name}`,
          body: `Time to complete your habit: ${habit.name}`,
          hour: hours || 9,
          minute: minutes || 0,
        });

        if (notificationId) {
          newHabit.notificationId = notificationId;
        }
      }

      storageData.habits.push(newHabit);
      storageData.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return newHabit;
    } catch (error) {
      console.error("Failed to add habit:", error);
      throw new Error("Failed to add new habit");
    }
  }

  async updateHabit(habit: Habit): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) throw new Error("No storage data found");

      const storageData: StorageData = JSON.parse(data);
      const index = storageData.habits.findIndex((h) => h.id === habit.id);

      if (index === -1) {
        throw new Error("Habit not found");
      }

      // Handle notification updates
      const oldHabit = storageData.habits[index];

      // Cancel existing notification if it exists
      if (oldHabit.notificationId) {
        await cancelHabitReminder(habit.id);
      }

      // Schedule new notification if enabled
      if (habit.reminderEnabled && habit.reminderTime) {
        const [hours, minutes] = habit.reminderTime.split(":").map(Number);

        const notificationId = await scheduleHabitReminder({
          habitId: habit.id,
          title: `Reminder: ${habit.name}`,
          body: `Time to complete your habit: ${habit.name}`,
          hour: hours || 9,
          minute: minutes || 0,
        });

        if (notificationId) {
          habit.notificationId = notificationId;
        }
      }

      storageData.habits[index] = habit;
      storageData.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Error updating habit:", error);
      throw new Error("Failed to update habit");
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) throw new Error("No storage data found");

      const storageData: StorageData = JSON.parse(data);
      storageData.habits = storageData.habits.filter(
        (habit) => habit.id !== habitId
      );
      storageData.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw new Error("Failed to delete habit");
    }
  }

  async restoreData(backupData: string): Promise<boolean> {
    try {
      const parsedData = JSON.parse(backupData) as StorageData;

      // Validate backup data structure
      if (!this.isValidStorageData(parsedData)) {
        throw new Error("Invalid backup data format");
      }

      // Perform data migration if needed
      const migratedData = await this.migrateData(parsedData);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      return true;
    } catch (error) {
      console.error("Restore failed:", error);
      throw new Error("Failed to restore data");
    }
  }

  async cleanupOldData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;

      const storageData: StorageData = JSON.parse(data);

      // Remove habits older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      storageData.habits = storageData.habits.filter((habit) => {
        const habitDate = new Date(habit.createdAt);
        return habitDate > oneYearAgo;
      });

      // Cleanup old completion logs
      storageData.habits.forEach((habit) => {
        habit.completionLogs = habit.completionLogs.filter((log) => {
          const logDate = new Date(log.date);
          return logDate > oneYearAgo;
        });
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw new Error("Failed to cleanup old data");
    }
  }

  private async migrateData(data: StorageData): Promise<StorageData> {
    // Handle data structure changes between versions
    switch (data.version) {
      case 1:
        // Current version, no migration needed
        return data;

      default:
        // Unknown version, return as is but log warning
        console.warn("Unknown data version:", data.version);
        return data;
    }
  }

  private isValidStorageData(data: any): data is StorageData {
    return (
      data &&
      Array.isArray(data.habits) &&
      typeof data.lastUpdated === "string" &&
      typeof data.version === "number" &&
      data.habits.every(
        (habit: any) =>
          habit.id &&
          habit.name &&
          habit.description &&
          habit.frequency &&
          habit.createdAt &&
          Array.isArray(habit.completionLogs)
      )
    );
  }
}
