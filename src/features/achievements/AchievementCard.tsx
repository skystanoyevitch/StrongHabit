import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Achievement } from "./types";
import { theme } from "../../constants/theme"; // Import theme

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  showTooltip?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  showTooltip,
}) => {
  // Determine icon background color based on achievement type
  const getIconBackgroundColor = (type: string) => {
    switch (type) {
      case "streak":
        return isUnlocked ? "#FDBA74" : "#FEF3C7";
      case "completion":
        return isUnlocked ? "#93C5FD" : "#DBEAFE";
      case "consistency":
        return isUnlocked ? "#A7F3D0" : "#D1FAE5";
      default:
        return isUnlocked ? theme.colors.primary : "#E5E7EB";
    }
  };

  // Determine icon color based on achievement type
  const getIconColor = (type: string) => {
    switch (type) {
      case "streak":
        return isUnlocked ? "#EA580C" : "#F97316";
      case "completion":
        return isUnlocked ? "#1D4ED8" : "#3B82F6";
      case "consistency":
        return isUnlocked ? "#047857" : "#10B981";
      default:
        return isUnlocked ? theme.colors.primary : "#9CA3AF";
    }
  };

  // Format unlock date if provided
  const formatUnlockDate = () => {
    if (!achievement.unlockedAt) return null;

    const date = new Date(achievement.unlockedAt);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const iconBgColor = getIconBackgroundColor(achievement.type);
  const iconColor = getIconColor(achievement.type);

  return (
    <TouchableOpacity
      style={[styles.container, !isUnlocked && styles.locked]}
      onPress={showTooltip}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <MaterialCommunityIcons
          name={achievement.icon as any}
          size={24}
          color={iconColor}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>
        {isUnlocked && achievement.unlockedAt && (
          <Text style={styles.unlockDate}>
            Unlocked on {formatUnlockDate()}
          </Text>
        )}
      </View>
      {isUnlocked ? (
        <MaterialCommunityIcons
          name="trophy"
          size={24}
          color="#4CAF50"
          style={styles.checkmark}
        />
      ) : (
        <View style={styles.lockIconContainer}>
          <MaterialCommunityIcons name="lock" size={18} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
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
    opacity: 0.8,
    backgroundColor: "#F9FAFB",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 16,
    color: "#1F2937",
  },
  lockedText: {
    color: "#6B7280",
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  unlockDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: "#059669",
    marginTop: 4,
    fontStyle: "italic",
  },
  checkmark: {
    marginLeft: 12,
  },
  lockIconContainer: {
    marginLeft: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
