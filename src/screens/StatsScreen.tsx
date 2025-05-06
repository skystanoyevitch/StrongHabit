import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions, // Import Dimensions
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit"; // Import LineChart
import { useHabits } from "../hooks/useHabits";
import { Habit } from "../types/habit";
import { StatsData } from "../types/stats";
import { calculateWeeklyStats } from "../utils/statsUtils";
import { StatsCard } from "../components/StatsCard";
// Remove WeeklyChart import
// import { WeeklyChart } from "../components/WeeklyChart";
import { AchievementsSection } from "../features/achievements/AchievementsSection";
import { sharedStyles } from "../styles/shared";
import { theme } from "../constants/theme"; // Import theme

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
  const [chartData, setChartData] = useState({
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  }); // State for chart data

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

      // Prepare data for LineChart
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayMapping: { [key: string]: string } = {
        Sunday: "Sun",
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
      };

      const completionsData = daysOfWeek.map((day) => {
        // Find the full day name corresponding to the abbreviation
        const fullDayName = Object.keys(dayMapping).find(
          (key) => dayMapping[key] === day
        );
        return fullDayName ? weeklyStats.dailyCompletions[fullDayName] || 0 : 0;
      });

      setChartData({
        labels: daysOfWeek,
        datasets: [
          {
            data: completionsData,
            // strokeWidth: 2, // Removed this as it causes type error
          },
        ],
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [habits]); // Remove statsData dependency as it causes infinite loop

  useEffect(() => {
    // Recalculate only when habits change or screen focuses
    if (habits && isFocused) {
      calculateStats();
    } else if (!isFocused) {
      // Optional: Reset stats or show a placeholder when screen is not focused
      // setStatsData(initialStats);
      // setChartData({ labels: [], datasets: [{ data: [] }] });
    }
    // Remove calculateStats from dependency array if it causes issues,
    // ensure all its own dependencies (like habits) are correctly listed in its useCallback hook.
  }, [habits, isFocused]); // Keep calculateStats out if it causes loops, rely on habits/isFocused

  if (loading && habits === null) {
    // Adjust loading condition
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} /> // Use
        theme color
        <Text style={styles.loadingText}>Loading your habit data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <Text style={styles.sectionTitle}>Weekly Completions</Text>
          <ChartErrorBoundary>
            {isCalculating ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 64} // from react-native
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(15, 77, 146, ${opacity})`, // Primary color #0F4D92
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.colors.primary, // Use theme color for dots
                  },
                }}
                bezier // Makes the line smooth
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
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
    backgroundColor: theme.colors.background, // Use theme background
  },
  scrollContainer: {
    paddingBottom: 20, // Add padding to bottom
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
    marginHorizontal: 16, // Use horizontal margin
    marginTop: 16, // Add top margin
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center", // Center chart horizontally
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    alignSelf: "flex-start", // Align title to the left
    paddingLeft: 16, // Add padding to align with chart content
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background, // Use theme background
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
});

export default StatsScreen;
