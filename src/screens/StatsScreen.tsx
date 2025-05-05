import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useHabits } from "../hooks/useHabits";
import { Habit } from "../types/habit";
import { StatsData } from "../types/stats";
import { calculateWeeklyStats } from "../utils/statsUtils";
import { StatsCard } from "../components/StatsCard";
import { WeeklyChart } from "../components/WeeklyChart";
import { AchievementsSection } from "../features/achievements/AchievementsSection";
import { sharedStyles } from "../styles/shared";

import {
  checkAchievements,
  UnlockedAchievement,
} from "../features/achievements/achievementUtils";
import { AnimatedTitle } from "../components/AnimatedTitle";
import ChartErrorBoundary from "../components/ChartErrorBoundry";

const initialStats: StatsData = {
  totalHabits: 0,
  activeHabits: 0,
  completionRate: 0,
  longestStreak: 0,
  habitWithLongestStreak: "",
  weeklyStats: {
    bestDay: "",
    dailyCompletions: {},
    totalCompletions: 0,
  },
};

const StatsScreen: React.FC = () => {
  const { habits, loading } = useHabits();
  const isFocused = useIsFocused();
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<StatsData>(initialStats);
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);

  const calculateStats = useCallback(() => {
    setIsCalculating(true);

    try {
      // Calculate active habits
      const activeHabits = habits.filter(
        (habit: Habit) => !habit.archivedAt
      ).length;

      const weeklyStats = calculateWeeklyStats(habits);

      // Find habit with longest streak
      const { maxStreak, habitWithMaxStreak } = habits.reduce(
        (acc, habit) => {
          if (habit.streak > acc.maxStreak) {
            return { maxStreak: habit.streak, habitWithMaxStreak: habit.name };
          }
          return acc;
        },
        { maxStreak: 0, habitWithMaxStreak: "" }
      );

      // Calculate completion rate
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { totalCompletions, totalPossible } = habits.reduce(
        (acc, habit) => {
          if (!habit.archivedAt) {
            acc.totalPossible += 7;

            const recentCompletions = habit.completionLogs.filter((log) => {
              const logDate = new Date(log.date);
              return log.completed && logDate >= oneWeekAgo && logDate <= today;
            }).length;

            acc.totalCompletions += recentCompletions;
          }
          return acc;
        },
        { totalCompletions: 0, totalPossible: 0 }
      );

      const completionRate =
        totalPossible > 0
          ? Math.round((totalCompletions / totalPossible) * 100)
          : 0;

      // Check achievements for each habit
      const allUnlockedAchievements = habits.flatMap((habit) =>
        checkAchievements(habit)
      );

      // Remove duplicates
      const uniqueAchievements = Array.from(
        new Map(allUnlockedAchievements.map((a) => [a.id, a])).values()
      );

      setUnlockedAchievements(uniqueAchievements);

      setStatsData({
        ...statsData,
        totalHabits: habits.length,
        activeHabits,
        completionRate,
        longestStreak: maxStreak,
        habitWithLongestStreak: habitWithMaxStreak,
        weeklyStats,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [habits]);

  useEffect(() => {
    if (habits.length > 0 && isFocused) {
      calculateStats();
    }
  }, [habits, isFocused, calculateStats]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your habit data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <AnimatedTitle text="Your Progress Dashboard" />

        <View style={styles.statsGrid}>
          <StatsCard
            title="Active Habits"
            value={statsData.activeHabits}
            style={styles.card}
          />
          <StatsCard
            title="Completion Rate"
            value={`${Math.round(statsData.completionRate)}%`}
            style={styles.card}
          />
          <StatsCard
            title="Longest Streak"
            value={statsData.longestStreak}
            subtitle={statsData.habitWithLongestStreak}
            style={styles.card}
          />
        </View>

        <View style={styles.chartSection}>
          <ChartErrorBoundary>
            <WeeklyChart
              dailyCompletions={statsData.weeklyStats.dailyCompletions}
            />
          </ChartErrorBoundary>
        </View>
        <AchievementsSection unlockedAchievements={unlockedAchievements} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // Softer background color
  },
  scrollContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20, // More rounded corners
  },
  chartSection: {
    backgroundColor: "#ffffff",
    padding: 16,
    margin: 16,
    borderRadius: 20, // More rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    padding: 16,
    textAlign: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20, // More rounded corners
    padding: 16,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F4D92", // Updated to match theme
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  streakContainer: {
    backgroundColor: "#fff",
    borderRadius: 20, // More rounded corners
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F4D92", // Updated to match theme
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    color: "#666",
  },
  streakHabit: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginTop: 4,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20, // More rounded corners
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
});

export default StatsScreen;
