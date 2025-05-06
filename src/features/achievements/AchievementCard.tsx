import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Achievement } from "./types";
import { theme } from "../../constants/theme"; // Import theme

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
}) => {
  return (
    <View style={[styles.container, !isUnlocked && styles.locked]}>
      <MaterialCommunityIcons
        name={achievement.icon as any}
        size={24}
        color={isUnlocked ? "#007AFF" : "#9CA3AF"}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
      {isUnlocked && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color="#4CAF50"
          style={styles.checkmark}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locked: {
    opacity: 0.7,
    backgroundColor: "#F3F4F6",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 16,
    // fontWeight: "600", // fontWeight is part of fontFamily now
    color: "#1F2937",
  },
  lockedText: {
    color: "#9CA3AF",
  },
  description: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  checkmark: {
    marginLeft: 12,
  },
});
