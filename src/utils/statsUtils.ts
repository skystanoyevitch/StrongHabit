import { Habit } from "../types/habit";

export interface WeeklyStats {
  completionRate: number;
  totalCompletions: number;
  bestDay: string;
  dailyCompletions: Record<string, number>;
}

export const calculateWeeklyStats = (habits: Habit[]): WeeklyStats => {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dailyCompletions: Record<string, number> = {};
  let totalCompletions = 0;
  let totalPossible = 0;

  habits.forEach((habit) => {
    if (!habit.archivedAt) {
      Object.entries(habit.completionLogs).forEach(([dateStr, completed]) => {
        const date = new Date(dateStr);
        if (date >= oneWeekAgo && date <= today) {
          const dayName = days[date.getDay()];
          if (completed) {
            dailyCompletions[dayName] = (dailyCompletions[dayName] || 0) + 1;
            totalCompletions++;
          }
          totalPossible++;
        }
      });
    }
  });

  const bestDay =
    Object.entries(dailyCompletions).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "";

  return {
    completionRate:
      totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0,
    totalCompletions,
    bestDay,
    dailyCompletions,
  };
};
