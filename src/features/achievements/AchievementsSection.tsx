import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AchievementCard } from "./AchievementCard";
import { ACHIEVEMENTS } from "./achievementList";
import { UnlockedAchievement, sortAchievements } from "./achievementUtils";
import { Achievement } from "./types";
import { theme } from "../../constants/theme"; // Import theme

interface AchievementsSectionProps {
  unlockedAchievements: UnlockedAchievement[];
}

type AchievementGroup = {
  type: string;
  title: string;
  achievements: Achievement[];
};

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  unlockedAchievements,
}) => {
  // Group achievements by type
  const achievementGroups: AchievementGroup[] = useMemo(() => {
    // Sort achievements by type and threshold
    const sortedAchievements = sortAchievements(ACHIEVEMENTS);

    // Group by type
    const groups: Record<string, Achievement[]> = {};
    sortedAchievements.forEach((achievement) => {
      if (!groups[achievement.type]) {
        groups[achievement.type] = [];
      }
      groups[achievement.type].push(achievement);
    });

    // Create named groups
    return [
      {
        type: "streak",
        title: "Streak Achievements",
        achievements: groups["streak"] || [],
      },
      {
        type: "completion",
        title: "Completion Achievements",
        achievements: groups["completion"] || [],
      },
      {
        type: "consistency",
        title: "Consistency Achievements",
        achievements: groups["consistency"] || [],
      },
    ];
  }, []);

  // Function to calculate progress for an achievement type
  const getAchievementProgress = (
    type: string
  ): { unlocked: number; total: number } => {
    const typeAchievements = ACHIEVEMENTS.filter((a) => a.type === type);
    const unlockedOfType = unlockedAchievements.filter((a) => a.type === type);

    return {
      unlocked: unlockedOfType.length,
      total: typeAchievements.length,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Achievements</Text>

      {achievementGroups.map((group) => {
        const progress = getAchievementProgress(group.type);

        return (
          <View key={group.type} style={styles.achievementGroup}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.progressText}>
                {progress.unlocked}/{progress.total} Unlocked
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      (progress.unlocked / Math.max(1, progress.total)) * 100
                    }%`,
                    backgroundColor:
                      progress.unlocked > 0
                        ? theme.colors.primary
                        : theme.colors.disabled,
                  },
                ]}
              />
            </View>

            {group.achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedAchievements.some(
                  (a) => a.id === achievement.id
                )}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleBold,
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 16,
  },
  achievementGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  groupTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 16,
    color: "#1F2937",
  },
  progressText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.primary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
