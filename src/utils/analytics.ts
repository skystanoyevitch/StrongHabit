import analytics from "@react-native-firebase/analytics";

/**
 * Analytics service for tracking user actions and events
 * This centralizes all analytics tracking in one place for easier management
 */
class AnalyticsService {
  /**
   * Track when a user views a screen
   * @param screenName Name of the screen viewed
   * @param screenClass Optional class name of the screen
   */
  async trackScreenView(
    screenName: string,
    screenClass?: string
  ): Promise<void> {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`[Analytics] Screen view tracked: ${screenName}`);
    } catch (error) {
      console.error("[Analytics] Error tracking screen view:", error);
    }
  }

  /**
   * Track when a user creates a habit
   * @param habitId Unique ID of the habit
   * @param habitName Name of the habit
   * @param category Category of the habit
   * @param frequency Frequency goal for the habit
   */
  async trackHabitCreated(
    habitId: string,
    habitName: string,
    category: string,
    frequency: number
  ): Promise<void> {
    try {
      await analytics().logEvent("habit_created", {
        habit_id: habitId,
        habit_name: habitName,
        category,
        frequency,
      });
      console.log(`[Analytics] Habit created tracked: ${habitName}`);
    } catch (error) {
      console.error("[Analytics] Error tracking habit creation:", error);
    }
  }

  /**
   * Track when a user completes a habit
   * @param habitId Unique ID of the habit
   * @param habitName Name of the habit
   * @param streakCount Current streak count
   */
  async trackHabitCompleted(
    habitId: string,
    habitName: string,
    streakCount: number
  ): Promise<void> {
    try {
      await analytics().logEvent("habit_completed", {
        habit_id: habitId,
        habit_name: habitName,
        streak_count: streakCount,
      });
      console.log(`[Analytics] Habit completion tracked: ${habitName}`);
    } catch (error) {
      console.error("[Analytics] Error tracking habit completion:", error);
    }
  }

  /**
   * Track when a user achieves a streak milestone
   * @param habitId Unique ID of the habit
   * @param habitName Name of the habit
   * @param milestone The streak milestone achieved (7, 14, 30, etc.)
   */
  async trackStreakMilestone(
    habitId: string,
    habitName: string,
    milestone: number
  ): Promise<void> {
    try {
      await analytics().logEvent("streak_milestone", {
        habit_id: habitId,
        habit_name: habitName,
        milestone,
      });
      console.log(
        `[Analytics] Streak milestone tracked: ${habitName} - ${milestone} days`
      );
    } catch (error) {
      console.error("[Analytics] Error tracking streak milestone:", error);
    }
  }

  /**
   * Track when a user breaks a streak
   * @param habitId Unique ID of the habit
   * @param habitName Name of the habit
   * @param previousStreak Previous streak count before breaking
   */
  async trackStreakBroken(
    habitId: string,
    habitName: string,
    previousStreak: number
  ): Promise<void> {
    try {
      await analytics().logEvent("streak_broken", {
        habit_id: habitId,
        habit_name: habitName,
        previous_streak: previousStreak,
      });
      console.log(
        `[Analytics] Streak broken tracked: ${habitName} - ${previousStreak} days`
      );
    } catch (error) {
      console.error("[Analytics] Error tracking broken streak:", error);
    }
  }

  /**
   * Track when a user unlocks an achievement
   * @param achievementId Unique ID of the achievement
   * @param achievementName Name of the achievement
   * @param daysToAchieve Number of days it took to achieve
   */
  async trackAchievementUnlocked(
    achievementId: string,
    achievementName: string,
    daysToAchieve: number
  ): Promise<void> {
    try {
      await analytics().logEvent("achievement_unlocked", {
        achievement_id: achievementId,
        achievement_name: achievementName,
        days_to_achieve: daysToAchieve,
      });
      console.log(
        `[Analytics] Achievement unlocked tracked: ${achievementName}`
      );
    } catch (error) {
      console.error("[Analytics] Error tracking achievement unlock:", error);
    }
  }

  /**
   * Track when a user views statistics
   * @param statsType Type of statistics viewed
   * @param habitId Optional habit ID if stats are for a specific habit
   */
  async trackStatsViewed(statsType: string, habitId?: string): Promise<void> {
    try {
      await analytics().logEvent("stats_viewed", {
        stats_type: statsType,
        habit_id: habitId || "all",
      });
      console.log(`[Analytics] Stats viewed tracked: ${statsType}`);
    } catch (error) {
      console.error("[Analytics] Error tracking stats view:", error);
    }
  }

  /**
   * Set user properties for better segmentation
   * @param totalHabits Total number of habits created
   * @param longestStreak Longest streak achieved
   * @param mostConsistentCategory Most consistent habit category
   * @param totalAchievements Total achievements earned
   */
  async setUserProperties(
    totalHabits: number,
    longestStreak: number,
    mostConsistentCategory: string,
    totalAchievements: number
  ): Promise<void> {
    try {
      await analytics().setUserProperties({
        total_habits: String(totalHabits),
        longest_streak: String(longestStreak),
        most_consistent_category: mostConsistentCategory,
        total_achievements: String(totalAchievements),
      });
      console.log("[Analytics] User properties set successfully");
    } catch (error) {
      console.error("[Analytics] Error setting user properties:", error);
    }
  }
}

// Export a singleton instance of the service
export const analyticsService = new AnalyticsService();
