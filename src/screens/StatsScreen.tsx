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

const initialStats: StatsData = {
  totalHabits: 0,
  activeHabits: 0,
  completionRate: 0,
  longestStreak: 0,
  habitWithLongestStreak: "",
};

const StatsScreen: React.FC = () => {
  const { habits, loading } = useHabits();
  const isFocused = useIsFocused();
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<StatsData>(initialStats);

  const calculateStats = useCallback(() => {
    setIsCalculating(true);

    try {
      // Calculate active habits
      const activeHabits = habits.filter(
        (habit: Habit) => !habit.archivedAt
      ).length;

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

      setStatsData({
        totalHabits: habits.length,
        activeHabits,
        completionRate,
        longestStreak: maxStreak,
        habitWithLongestStreak: habitWithMaxStreak,
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Your Progress</Text>

        {isCalculating ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Add some habits to see your statistics!
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{statsData.totalHabits}</Text>
                <Text style={styles.summaryLabel}>Total Habits</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {statsData.activeHabits}
                </Text>
                <Text style={styles.summaryLabel}>Active Habits</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {statsData.completionRate}%
                </Text>
                <Text style={styles.summaryLabel}>Completion Rate</Text>
              </View>
            </View>

            {/* Streak Information */}
            <View style={styles.streakContainer}>
              <Text style={styles.sectionTitle}>Current Streaks</Text>
              {statsData.longestStreak > 0 ? (
                <View style={styles.streakCard}>
                  <Text style={styles.streakValue}>
                    {statsData.longestStreak}
                  </Text>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakLabel}>Longest Streak</Text>
                    <Text style={styles.streakHabit}>
                      {statsData.habitWithLongestStreak}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noDataText}>
                  Complete your habits consistently to build streaks!
                </Text>
              )}
            </View>

            {/* We'll add chart components here later */}
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Weekly Overview</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>Charts coming soon!</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#333",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
    color: "#007AFF",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  streakContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
    color: "#007AFF",
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
  chartSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
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
