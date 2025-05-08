import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useHabits } from "../hooks/useHabits";
import { Habit } from "../types/habit";
import { StatsData } from "../types/stats";
import { calculateWeeklyStats } from "../utils/statsUtils";
import { StatsCard } from "../components/StatsCard";
import { AchievementsSection } from "../features/achievements/AchievementsSection";
import { sharedStyles } from "../styles/shared";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  checkAchievements,
  UnlockedAchievement,
  sortAchievements,
} from "../features/achievements/achievementUtils";
import { AnimatedTitle } from "../components/AnimatedTitle";
import ChartErrorBoundary from "../components/ChartErrorBoundry";

// Key for storing already displayed achievements
const VIEWED_ACHIEVEMENTS_KEY = "@viewed_achievements";

// Initial stats state
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
  });

  // Add state for new achievement notification
  const [newAchievements, setNewAchievements] = useState<UnlockedAchievement[]>(
    []
  );
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [viewedAchievements, setViewedAchievements] = useState<string[]>([]);

  // Get previously viewed achievements from storage
  useEffect(() => {
    const loadViewedAchievements = async () => {
      try {
        const viewed = await AsyncStorage.getItem(VIEWED_ACHIEVEMENTS_KEY);
        if (viewed) {
          setViewedAchievements(JSON.parse(viewed));
        }
      } catch (error) {
        console.error("Failed to load viewed achievements:", error);
      }
    };

    loadViewedAchievements();
  }, []);

  // Recent unlocked achievements for the highlight section
  const recentAchievements = useMemo(() => {
    return [...unlockedAchievements]
      .sort(
        (a, b) =>
          new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      )
      .slice(0, 3); // Take only the 3 most recent
  }, [unlockedAchievements]);

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

      // Check for new achievements
      const newlyUnlocked = uniqueAchievements.filter(
        (achievement) => !viewedAchievements.includes(achievement.id)
      );

      if (newlyUnlocked.length > 0) {
        setNewAchievements(newlyUnlocked);
        setShowAchievementModal(true);

        // Save newly viewed achievements
        const updatedViewed = [
          ...viewedAchievements,
          ...newlyUnlocked.map((a) => a.id),
        ];
        setViewedAchievements(updatedViewed);
        AsyncStorage.setItem(
          VIEWED_ACHIEVEMENTS_KEY,
          JSON.stringify(updatedViewed)
        ).catch((err) =>
          console.error("Failed to save viewed achievements:", err)
        );
      }

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
          },
        ],
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [habits, viewedAchievements]);

  // Handle next achievement in modal
  const handleNextAchievement = () => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      setCurrentAchievementIndex(currentAchievementIndex + 1);
    } else {
      setShowAchievementModal(false);
      setCurrentAchievementIndex(0);
    }
  };

  useEffect(() => {
    if (habits && isFocused) {
      calculateStats();
    }
  }, [habits, isFocused, calculateStats]);

  if (loading && habits === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your habit data...</Text>
      </View>
    );
  }

  // Achievement celebration modal
  const renderAchievementModal = () => {
    if (!showAchievementModal || newAchievements.length === 0) return null;

    const achievement = newAchievements[currentAchievementIndex];
    const iconBgColor =
      achievement.type === "streak"
        ? "#FDBA74"
        : achievement.type === "completion"
        ? "#93C5FD"
        : "#A7F3D0";
    const iconColor =
      achievement.type === "streak"
        ? "#EA580C"
        : achievement.type === "completion"
        ? "#1D4ED8"
        : "#047857";

    return (
      <Modal
        visible={showAchievementModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.achievementModal}>
            <View style={styles.confettiContainer}>
              <Text style={styles.confetti}>🎉</Text>
              <Text style={styles.confetti}>🏆</Text>
              <Text style={styles.confetti}>✨</Text>
            </View>

            <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>

            <View
              style={[
                styles.achievementIconContainer,
                { backgroundColor: iconBgColor },
              ]}
            >
              <MaterialCommunityIcons
                name={achievement.icon as any}
                size={60}
                color={iconColor}
              />
            </View>

            <Text style={styles.modalAchievementTitle}>
              {achievement.title}
            </Text>
            <Text style={styles.modalAchievementDesc}>
              {achievement.description}
            </Text>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextAchievement}
            >
              <Text style={styles.nextButtonText}>
                {currentAchievementIndex < newAchievements.length - 1
                  ? "Next"
                  : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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

        {/* Recent Achievements Section */}
        {recentAchievements.length > 0 && (
          <View style={styles.recentAchievementsSection}>
            <Text style={styles.recentAchievementsTitle}>
              Recent Achievements
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentAchievementsList}
            >
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.recentAchievementCard}>
                  <View
                    style={[
                      styles.recentAchievementIcon,
                      {
                        backgroundColor:
                          achievement.type === "streak"
                            ? "#FDBA74"
                            : achievement.type === "completion"
                            ? "#93C5FD"
                            : "#A7F3D0",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={achievement.icon as any}
                      size={30}
                      color={
                        achievement.type === "streak"
                          ? "#EA580C"
                          : achievement.type === "completion"
                          ? "#1D4ED8"
                          : "#047857"
                      }
                    />
                  </View>
                  <Text style={styles.recentAchievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Completions</Text>
          <ChartErrorBoundary>
            {isCalculating ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(15, 77, 146, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.colors.primary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
          </ChartErrorBoundary>
        </View>

        {/* Render the main achievements section */}
        <AchievementsSection unlockedAchievements={unlockedAchievements} />

        {/* Achievement celebration modal */}
        {renderAchievementModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Keep existing styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingBottom: 20,
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
    borderRadius: 24,
  },
  chartSection: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    elevation: 2,
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    marginBottom: 16,
    color: theme.colors.text,
    alignSelf: "flex-start",
    paddingLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 10,
  },

  // New styles for recent achievements
  recentAchievementsSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  recentAchievementsTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.text,
  },
  recentAchievementsList: {
    paddingVertical: 8,
  },
  recentAchievementCard: {
    width: 100,
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentAchievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  recentAchievementTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    textAlign: "center",
    color: "#4B5563",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementModal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  confettiContainer: {
    position: "absolute",
    top: -20,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  confetti: {
    fontSize: 30,
  },
  achievementTitle: {
    fontFamily: theme.fonts.titleBold,
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: 20,
  },
  achievementIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalAchievementTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    color: "#1F2937",
    marginBottom: 8,
  },
  modalAchievementDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    fontFamily: theme.fonts.semibold,
    color: "#fff",
    fontSize: 16,
  },
});

export default StatsScreen;
