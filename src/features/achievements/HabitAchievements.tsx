import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Habit } from "../../types/habit";
import { Achievement } from "./types";
import { checkAchievements, sortAchievements } from "./achievementUtils";
import { theme } from "../../constants/theme";
import { ACHIEVEMENTS } from "./achievementList";

interface HabitAchievementsProps {
  habit: Habit;
}

export const HabitAchievements: React.FC<HabitAchievementsProps> = ({
  habit,
}) => {
  // Check which achievements this habit has unlocked
  const unlockedAchievements = useMemo(() => {
    return checkAchievements(habit);
  }, [habit]);

  // Group achievements by type
  const groupedAchievements = useMemo(() => {
    const allAchievements = sortAchievements(ACHIEVEMENTS);
    const grouped: Record<
      string,
      { total: number; unlocked: number; next?: Achievement }
    > = {
      streak: { total: 0, unlocked: 0 },
      completion: { total: 0, unlocked: 0 },
      consistency: { total: 0, unlocked: 0 },
    };

    // Count total in each group
    allAchievements.forEach((achievement) => {
      if (grouped[achievement.type]) {
        grouped[achievement.type].total += 1;
      }
    });

    // Count unlocked and find next achievement to earn
    Object.keys(grouped).forEach((type) => {
      const typeAchievements = allAchievements.filter((a) => a.type === type);
      const unlockedOfType = unlockedAchievements.filter(
        (a) => a.type === type
      );

      grouped[type].unlocked = unlockedOfType.length;

      // Find the next achievement to earn (lowest threshold not yet unlocked)
      const nextAchievement = typeAchievements.find(
        (a) => !unlockedAchievements.some((ua) => ua.id === a.id)
      );

      if (nextAchievement) {
        grouped[type].next = nextAchievement;
      }
    });

    return grouped;
  }, [unlockedAchievements]);

  // Format the current progress for a specific achievement type
  const getProgressText = (type: string) => {
    switch (type) {
      case "streak":
        return `Current streak: ${habit.streak} days`;
      case "completion":
        const completions = habit.completionLogs.filter(
          (log) => log.completed
        ).length;
        return `Completed ${completions} times`;
      case "consistency":
        // This would need the getConsistentTimePeriod function from achievementUtils.ts
        return "Keep a consistent schedule";
      default:
        return "";
    }
  };

  // Get appropriate color for achievement type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "streak":
        return "#EA580C";
      case "completion":
        return "#1D4ED8";
      case "consistency":
        return "#047857";
      default:
        return theme.colors.primary;
    }
  };

  // Get appropriate background color for achievement type
  const getTypeBackgroundColor = (type: string) => {
    switch (type) {
      case "streak":
        return "#FEF3C7";
      case "completion":
        return "#DBEAFE";
      case "consistency":
        return "#D1FAE5";
      default:
        return "#E5E7EB";
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "streak":
        return "Streak";
      case "completion":
        return "Completion";
      case "consistency":
        return "Consistency";
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievement Progress</Text>

      {Object.keys(groupedAchievements).map((type) => {
        const group = groupedAchievements[type];
        const progress = group.unlocked / group.total;
        const typeColor = getTypeColor(type);
        const typeBgColor = getTypeBackgroundColor(type);

        return (
          <View key={type} style={styles.achievementGroup}>
            {/* Type header */}
            <View style={styles.typeHeader}>
              <View style={[styles.typeIcon, { backgroundColor: typeBgColor }]}>
                <MaterialCommunityIcons
                  name={
                    type === "streak"
                      ? "fire"
                      : type === "completion"
                      ? "check-circle"
                      : "clock-outline"
                  }
                  size={18}
                  color={typeColor}
                />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>{getTypeLabel(type)}</Text>
                <Text style={styles.typeProgress}>
                  {group.unlocked} of {group.total} achievements unlocked
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: progress > 0 ? typeColor : "#E5E7EB",
                  },
                ]}
              />
            </View>

            {/* Next achievement to earn */}
            {group.next && (
              <View style={styles.nextAchievement}>
                <Text style={styles.nextLabel}>Next achievement:</Text>
                <Text style={styles.nextTitle}>{group.next.title}</Text>
                <Text style={styles.progressText}>{getProgressText(type)}</Text>
              </View>
            )}
          </View>
        );
      })}

      {unlockedAchievements.length === 0 && (
        <View style={styles.noAchievementsContainer}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={40}
            color="#9CA3AF"
          />
          <Text style={styles.noAchievementsText}>
            No achievements unlocked yet for this habit.
          </Text>
          <Text style={styles.noAchievementsSubtext}>
            Keep going with your habit to earn achievements!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 16,
  },
  achievementGroup: {
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.text,
  },
  typeProgress: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: "#6B7280",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  nextAchievement: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  nextLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  nextTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  progressText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.primary,
  },
  noAchievementsContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noAchievementsText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  noAchievementsSubtext: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
});
