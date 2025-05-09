import { Habit } from "../../types/habit";
import { Achievement } from "./types";
import { ACHIEVEMENTS } from "./achievementList";

export interface UnlockedAchievement extends Achievement {
  unlockedAt: string;
}

// Helper to determine if a completion happened at a consistent time
export const getConsistentTimePeriod = (
  completionLogs: Habit["completionLogs"]
): number => {
  if (completionLogs.length < 2) return 0;

  // Filter for completed logs and sort by date
  const completedLogs = [...completionLogs]
    .filter((log) => log.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (completedLogs.length < 2) return 0;

  // Group logs by hour of day
  const hourGroups: Record<number, string[]> = {};

  completedLogs.forEach((log) => {
    const date = new Date(log.date);
    const hour = date.getHours();
    if (!hourGroups[hour]) hourGroups[hour] = [];
    hourGroups[hour].push(log.date);
  });

  // Find the hour with the most consecutive completions
  let maxConsecutiveDays = 0;

  Object.values(hourGroups).forEach((dates) => {
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);

      // Check if dates are consecutive days
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    maxConsecutiveDays = Math.max(maxConsecutiveDays, maxStreak);
  });

  return maxConsecutiveDays;
};

export const checkAchievements = (habit: Habit): UnlockedAchievement[] => {
  const unlockedAchievements: UnlockedAchievement[] = [];
  const now = new Date().toISOString();

  ACHIEVEMENTS.forEach((achievement) => {
    switch (achievement.type) {
      case "streak":
        if (habit.streak >= achievement.threshold) {
          unlockedAchievements.push({
            ...achievement,
            unlockedAt: now,
          });
        }
        break;

      case "completion":
        // Count actual completed logs
        const totalCompletions = habit.completionLogs.filter(
          (log) => log.completed
        ).length;
        if (totalCompletions >= achievement.threshold) {
          unlockedAchievements.push({
            ...achievement,
            unlockedAt: now,
          });
        }
        break;

      case "consistency":
        // Check for completions at consistent times
        const consistencyDays = getConsistentTimePeriod(habit.completionLogs);
        if (consistencyDays >= achievement.threshold) {
          unlockedAchievements.push({
            ...achievement,
            unlockedAt: now,
          });
        }
        break;
    }
  });

  return unlockedAchievements;
};

// Function to sort achievements by type and threshold
export const sortAchievements = (
  achievements: Achievement[]
): Achievement[] => {
  return [...achievements].sort((a, b) => {
    // First sort by type
    const typeOrder = { streak: 1, completion: 2, consistency: 3 };
    const typeA = typeOrder[a.type as keyof typeof typeOrder];
    const typeB = typeOrder[b.type as keyof typeof typeOrder];

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // Then sort by threshold
    return a.threshold - b.threshold;
  });
};
