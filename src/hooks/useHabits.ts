import { useState, useEffect, useCallback, useRef } from "react";
import { Habit } from "../types/habit";
import { StorageService } from "../utils/storage";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const habitsHashRef = useRef<string>("");

  const storageService = StorageService.getInstance();

  // Create a simple hash of habits data to detect real changes
  const createHabitsHash = useCallback((habitsData: Habit[]): string => {
    return JSON.stringify(
      habitsData.map((habit) => ({
        id: habit.id,
        streak: habit.streak,
        completionLogs: habit.completionLogs,
        updatedAt: habit.updatedAt,
      }))
    );
  }, []);

  // Update the refreshHabits method to return a Promise
  const refreshHabits = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const loadedHabits = await storageService.getHabits();

      // Check if habits have actually changed
      const newHash = createHabitsHash(loadedHabits);
      if (newHash !== habitsHashRef.current) {
        habitsHashRef.current = newHash;
        setHabits(loadedHabits);
        setLastUpdated(Date.now());
      } else {
        setHabits(loadedHabits);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, [createHabitsHash]);

  // Add new habit
  const addHabit = useCallback(
    async (
      habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
    ) => {
      try {
        const newHabit = await storageService.addHabit(habitData);
        const updatedHabits = [...habits, newHabit];
        const newHash = createHabitsHash(updatedHabits);
        habitsHashRef.current = newHash;
        setHabits(updatedHabits);
        setLastUpdated(Date.now());
        return newHabit;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add habit");
        throw err;
      }
    },
    [habits, createHabitsHash]
  );

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  return {
    habits,
    loading,
    error,
    addHabit,
    refreshHabits,
    lastUpdated, // Export lastUpdated for components to track changes
  };
}
