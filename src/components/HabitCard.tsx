import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Habit } from "../types/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper function to get frequency information
const getFrequencyInfo = (habit: Habit) => {
  const { frequency, selectedDays } = habit;

  switch (frequency) {
    case "daily":
      return {
        icon: "calendar-today" as const,
        label: "Daily",
        details: "Every day",
      };
    case "weekly":
      const daysCount = selectedDays?.length ?? 0;
      return {
        icon: "calendar-week" as const,
        label: "Weekly",
        details: `${daysCount} ${daysCount === 1 ? "day" : "days"} per week`,
      };
    default:
      return {
        icon: "calendar" as const,
        label: "Custom",
        details: "Custom schedule",
      };
  }
};

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onPress?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onPress,
}) => {
  // Calculate whether habit is completed today
  const isCompletedToday = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completionLogs.some(
      (log) => log.date.split("T")[0] === today && log.completed
    );
  }, [habit.completionLogs]);

  const frequencyInfo = React.useMemo(() => getFrequencyInfo(habit), [habit]);

  // Handle completion toggle with animation
  const handleToggle = () => {
    // Trigger nice animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleComplete(habit.id, !isCompletedToday);
  };

  const baseColor = isCompletedToday ? "#808080" : habit.color || "#0F4D92";
  const gradientColors = isCompletedToday
    ? (["#A0A0A0", "#808080", "#606060"] as const)
    : ([
        darkenColor(baseColor, 30),
        darkenColor(baseColor, 15),
        baseColor,
      ] as const);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={[styles.card, isCompletedToday && styles.completedCard]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.mainContent}>
            <Text style={styles.title}>{habit.name}</Text>
            {habit.description && (
              <Text style={styles.description} numberOfLines={2}>
                {habit.description}
              </Text>
            )}

            <View style={styles.bentoBox}>
              <View style={styles.frequencySection}>
                <MaterialCommunityIcons
                  name={frequencyInfo.icon}
                  size={20}
                  color="#fff"
                  style={styles.frequencyIcon}
                />
                <View style={styles.frequencyTextContainer}>
                  <Text style={styles.frequencyLabel}>
                    {frequencyInfo.label}
                  </Text>
                  <Text style={styles.frequencyDetails}>
                    {frequencyInfo.details}
                  </Text>
                </View>
              </View>

              <View style={styles.streakSection}>
                <MaterialCommunityIcons
                  name="fire"
                  size={20}
                  color="#fff"
                  style={styles.streakIcon}
                />
                <View style={styles.streakTextContainer}>
                  <Text style={styles.streakCount}>{habit.streak} Days</Text>
                  <Text style={styles.streakLabel}>Current Streak</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              isCompletedToday && styles.checkButtonCompleted,
            ]}
            onPress={handleToggle}
          >
            {isCompletedToday && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Helper function to lighten a color
const lightenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, ((num >> 16) & 0xff) + amt);
  const G = Math.min(255, ((num >> 8) & 0xff) + amt);
  const B = Math.min(255, (num & 0xff) + amt);
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
};

// Add new helper function to darken colors
const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, ((num >> 16) & 0xff) - amt);
  const G = Math.max(0, ((num >> 8) & 0xff) - amt);
  const B = Math.max(0, (num & 0xff) - amt);
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, // More rounded corners
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    transform: [{ translateY: -4 }],
  },
  completedCard: {
    transform: [{ translateY: 0 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    opacity: 0.8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bentoBox: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  frequencySection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  streakSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  frequencyIcon: {
    marginRight: 8,
  },
  streakIcon: {
    marginRight: 8,
  },
  frequencyTextContainer: {
    flex: 1,
  },
  streakTextContainer: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  frequencyDetails: {
    fontSize: 12,
    marginTop: 2,
    color: "#fff",
    opacity: 0.95,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#fff",
    opacity: 0.95,
  },
  checkButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkButtonCompleted: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
