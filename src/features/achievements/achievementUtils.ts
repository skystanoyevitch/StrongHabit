import { Habit } from "../../types/habit";
import { Achievement } from "./types";
import { ACHIEVEMENTS } from "./achievementList";

export interface UnlockedAchievement extends Achievement {
  unlockedAt: string;
}

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
        const totalCompletions = Object.values(habit.completionLogs).filter(
          Boolean
        ).length;
        if (totalCompletions >= achievement.threshold) {
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
