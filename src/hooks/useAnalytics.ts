import { useEffect } from "react";
import { analyticsService } from "../utils/analytics";

/**
 * Custom hook for tracking screen views
 * @param screenName Name of the screen to track
 * @param screenClass Optional class name of the screen
 */
export const useScreenTracking = (screenName: string, screenClass?: string) => {
  useEffect(() => {
    // Track screen view when component mounts
    analyticsService.trackScreenView(screenName, screenClass);
  }, [screenName, screenClass]);
};

/**
 * Custom hook for analytics functionality
 * Provides easy access to analytics tracking methods
 */
export const useAnalytics = () => {
  return {
    // Screen tracking
    trackScreenView: (screenName: string, screenClass?: string) =>
      analyticsService.trackScreenView(screenName, screenClass),

    // Habit tracking
    trackHabitCreated: (
      habitId: string,
      habitName: string,
      category: string,
      frequency: number
    ) =>
      analyticsService.trackHabitCreated(
        habitId,
        habitName,
        category,
        frequency
      ),
    trackHabitCompleted: (
      habitId: string,
      habitName: string,
      streakCount: number
    ) => analyticsService.trackHabitCompleted(habitId, habitName, streakCount),

    // Streak tracking
    trackStreakMilestone: (
      habitId: string,
      habitName: string,
      milestone: number
    ) => analyticsService.trackStreakMilestone(habitId, habitName, milestone),
    trackStreakBroken: (
      habitId: string,
      habitName: string,
      previousStreak: number
    ) => analyticsService.trackStreakBroken(habitId, habitName, previousStreak),

    // Achievement tracking
    trackAchievementUnlocked: (
      achievementId: string,
      achievementName: string,
      daysToAchieve: number
    ) =>
      analyticsService.trackAchievementUnlocked(
        achievementId,
        achievementName,
        daysToAchieve
      ),

    // Stats tracking
    trackStatsViewed: (statsType: string, habitId?: string) =>
      analyticsService.trackStatsViewed(statsType, habitId),

    // User properties
    setUserProperties: (
      totalHabits: number,
      longestStreak: number,
      mostConsistentCategory: string,
      totalAchievements: number
    ) =>
      analyticsService.setUserProperties(
        totalHabits,
        longestStreak,
        mostConsistentCategory,
        totalAchievements
      ),
  };
};
