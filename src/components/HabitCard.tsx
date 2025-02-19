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
  onpress: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onpress,
}) => {
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

  // Calculate streak text
  const streakText =
    habit.streak > 0 ? `${habit.streak} day streak!` : "Start your streak!";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompletedToday && styles.completedCard,
        { borderLeftColor: habit.color || "#007AFF" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={styles.title}>{habit.name}</Text>
          {habit.description && (
            <Text style={styles.description} numberOfLines={2}>
              {habit.description}
            </Text>
          )}
          <Text style={styles.streakText}>{streakText}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkButton, isCompletedToday && styles.checkedButton]}
          onPress={handleToggle}
        >
          {isCompletedToday && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
  },
  completedCard: {
    backgroundColor: "#f9f9f9",
    opacity: 0.9,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  streakText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  checkButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkedButton: {
    backgroundColor: "#007AFF",
  },
  checkIcon: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
