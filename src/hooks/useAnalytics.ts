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
    trackScreenView: analyticsService.trackScreenView,

    // Habit tracking
    trackHabitCreated: analyticsService.trackHabitCreated,
    trackHabitCompleted: analyticsService.trackHabitCompleted,

    // Streak tracking
    trackStreakMilestone: analyticsService.trackStreakMilestone,
    trackStreakBroken: analyticsService.trackStreakBroken,

    // Achievement tracking
    trackAchievementUnlocked: analyticsService.trackAchievementUnlocked,

    // Stats tracking
    trackStatsViewed: analyticsService.trackStatsViewed,

    // User properties
    setUserProperties: analyticsService.setUserProperties,
  };
};
