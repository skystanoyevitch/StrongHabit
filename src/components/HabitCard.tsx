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
import { getContrastTextColor } from "../utils/colorUtils";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const backgroundColor = habit.color || "#007AFF";
  const textColor = getContrastTextColor(backgroundColor);

  // Calculate whether habit is completed today
  const isCompletedToday = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completionLogs.some(
      (log) => log.date.split("T")[0] === today && log.completed
    );
  }, [habit.completionLogs]);

  // Handle completion toggle with animation
  const handleToggle = () => {
    // Trigger nice animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleComplete(habit.id, !isCompletedToday);
  };

  const getFrequencyInfo = () => {
    if (habit.frequency === "daily") {
      return {
        icon: "calendar-today" as const,
        label: "Daily",
        details: "Every day",
      };
    } else if (habit.frequency === "weekly" && habit.selectedDays?.length) {
      const days = habit.selectedDays.map((day) => day.slice(0, 3)).join(", ");
      return {
        icon: "calendar-week" as const,
        label: "Weekly",
        details: days,
      };
    }
    return {
      icon: "calendar-today" as const,
      label: "Daily",
      details: "Every day",
    };
  };

  const frequencyInfo = getFrequencyInfo();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor },
        isCompletedToday && styles.completedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={[styles.title, { color: textColor }]}>{habit.name}</Text>
          {habit.description && (
            <Text
              style={[styles.description, { color: textColor + "CC" }]}
              numberOfLines={2}
            >
              {habit.description}
            </Text>
          )}

          <View style={styles.bentoBox}>
            <View
              style={[
                styles.frequencySection,
                { borderColor: textColor + "40" },
              ]}
            >
              <MaterialCommunityIcons
                name={frequencyInfo.icon}
                size={20}
                color={textColor}
                style={styles.frequencyIcon}
              />
              <View style={styles.frequencyTextContainer}>
                <Text style={[styles.frequencyLabel, { color: textColor }]}>
                  {frequencyInfo.label}
                </Text>
                <Text
                  style={[styles.frequencyDetails, { color: textColor + "CC" }]}
                >
                  {frequencyInfo.details}
                </Text>
              </View>
            </View>

            <View
              style={[styles.streakSection, { borderColor: textColor + "40" }]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={20}
                color={textColor}
                style={styles.streakIcon}
              />
              <View style={styles.streakTextContainer}>
                <Text style={[styles.streakCount, { color: textColor }]}>
                  {habit.streak} Days
                </Text>
                <Text style={[styles.streakLabel, { color: textColor + "CC" }]}>
                  Current Streak
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: textColor },
            isCompletedToday && { backgroundColor: textColor },
          ]}
          onPress={handleToggle}
        >
          {isCompletedToday && (
            <Text style={[styles.checkIcon, { color: backgroundColor }]}>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.85,
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
    fontWeight: "600",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
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
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  streakSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
  },
  frequencyDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  checkButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
