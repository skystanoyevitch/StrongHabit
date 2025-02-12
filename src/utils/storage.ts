import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, HabitLog } from "../types/habit";

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

  // Add new habit
  async addHabit(
    habit: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
  ): Promise<Habit> {
    try {
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

      storageData.habits.push(newHabit);
      storageData.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return newHabit;
    } catch (error) {
      console.error("Failed to add habit:", error);
      throw new Error("Failed to add new habit");
    }
  }
}
