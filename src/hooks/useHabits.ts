import { useState, useEffect, useCallback } from "react";
import { Habit } from "../types/habit";
import { StorageService } from "../utils/storage";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageService = StorageService.getInstance();

  // Load habits
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const loadedHabits = await storageService.getHabits();
      setHabits(loadedHabits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new habit
  const addHabit = useCallback(
    async (
      habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
    ) => {
      try {
        const newHabit = await storageService.addHabit(habitData);
        setHabits((prev) => [...prev, newHabit]);
        return newHabit;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add habit");
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    loading,
    error,
    addHabit,
    refreshHabits: loadHabits,
  };
}
