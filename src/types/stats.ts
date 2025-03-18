export interface StatsData {
  totalHabits: number;
  activeHabits: number;
  completionRate: number;
  longestStreak: number;
  habitWithLongestStreak: string;
  weeklyStats: {
    bestDay: string;
    dailyCompletions: Record<string, number>;
    totalCompletions: number;
  };
}
