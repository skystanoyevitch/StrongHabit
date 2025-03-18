import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AchievementCard } from "./AchievementCard";
import { ACHIEVEMENTS } from "./achievementList";
import { UnlockedAchievement } from "./achievementUtils";

interface AchievementsSectionProps {
  unlockedAchievements: UnlockedAchievement[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  unlockedAchievements,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      {ACHIEVEMENTS.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          isUnlocked={unlockedAchievements.some((a) => a.id === achievement.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
});
