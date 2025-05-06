import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ColorValue, // Import ColorValue
} from "react-native";
import { Habit } from "../types/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper function to darken a hex color
// (This is a simple approximation and might not be perceptually perfect)
const darkenColor = (
  color: ColorValue | undefined,
  amount: number = 0.2
): string => {
  let col = String(color);
  // Use a darker default if color is missing or invalid
  if (!col || !col.startsWith("#")) {
    return "#0A3A70"; // Darker default blue
  }

  col = col.slice(1); // Remove #

  // Handle shorthand hex (e.g., #03F)
  if (col.length === 3) {
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
  }

  if (col.length !== 6) {
    return "#0A3A70"; // Darker default blue if not 6 digits
  }

  let r = parseInt(col.substring(0, 2), 16);
  let g = parseInt(col.substring(2, 4), 16);
  let b = parseInt(col.substring(4, 6), 16);

  // Darken each component
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  // Convert back to hex
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
};

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
  selectedDate: string; // Add selectedDate prop
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onPress,
  selectedDate, // Use selectedDate prop
}) => {
  // Calculate whether habit is completed for the selected date
  const isCompletedForSelectedDate = React.useMemo(() => {
    // Use selectedDate passed via props
    return habit.completionLogs.some(
      (log) => log.date.split("T")[0] === selectedDate && log.completed
    );
  }, [habit.completionLogs, selectedDate]); // Add selectedDate dependency

  const frequencyInfo = React.useMemo(() => getFrequencyInfo(habit), [habit]);

  // Handle completion toggle with animation
  const handleToggle = () => {
    // Trigger nice animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Use the correct completion status for the toggle
    onToggleComplete(habit.id, !isCompletedForSelectedDate);
  };

  // Use the darkenColor function for the base color
  const baseColor = isCompletedForSelectedDate // Use isCompletedForSelectedDate
    ? "#666666"
    : darkenColor(habit.color || "#0F4D92"); // Darker grey for completed, darken habit color otherwise

  // Ensure text color provides good contrast (using white as default for dark backgrounds)
  const textColor = "#FFFFFF"; // White text for contrast

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.card,
          { backgroundColor: baseColor }, // Apply the calculated baseColor
          isCompletedForSelectedDate && styles.completedCard, // Use isCompletedForSelectedDate
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.mainContent}>
            {/* Apply textColor */}
            <Text style={[styles.title, { color: textColor }]}>
              {habit.name}
            </Text>
            {habit.description && (
              <Text
                style={[styles.description, { color: textColor }]}
                numberOfLines={2}
              >
                {habit.description}
              </Text>
            )}

            <View style={styles.bentoBox}>
              <View
                style={[
                  styles.frequencySection,
                  { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                ]}
              >
                {" "}
                {/* Slightly less opaque background */}
                <MaterialCommunityIcons
                  name={frequencyInfo.icon}
                  size={20}
                  color={textColor} // Use textColor
                  style={styles.frequencyIcon}
                />
                <View style={styles.frequencyTextContainer}>
                  {/* Apply textColor */}
                  <Text style={[styles.frequencyLabel, { color: textColor }]}>
                    {frequencyInfo.label}
                  </Text>
                  <Text style={[styles.frequencyDetails, { color: textColor }]}>
                    {frequencyInfo.details}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.streakSection,
                  { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                ]}
              >
                {" "}
                {/* Slightly less opaque background */}
                <MaterialCommunityIcons
                  name="fire"
                  size={20}
                  color={textColor} // Use textColor
                  style={styles.streakIcon}
                />
                <View style={styles.streakTextContainer}>
                  {/* Apply textColor */}
                  <Text style={[styles.streakCount, { color: textColor }]}>
                    {habit.streak} Days
                  </Text>
                  <Text style={[styles.streakLabel, { color: textColor }]}>
                    Current Streak
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              { borderColor: textColor }, // Use textColor for border
              isCompletedForSelectedDate && [
                // Use isCompletedForSelectedDate
                styles.checkButtonCompleted,
                { backgroundColor: textColor, borderColor: textColor },
              ], // Use textColor for completed background/border
            ]}
            onPress={handleToggle}
          >
            {/* Use baseColor for the check icon color when completed */}
            {isCompletedForSelectedDate && ( // Use isCompletedForSelectedDate
              <Text style={[styles.checkIcon, { color: baseColor }]}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
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
    // backgroundColor is now applied dynamically
  },
  completedCard: {
    transform: [{ translateY: 0 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    opacity: 0.85, // Slightly increase opacity for darker completed state
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
    // color is now applied dynamically via style prop
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    // color is now applied dynamically via style prop
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
    // backgroundColor is now applied dynamically via style prop
  },
  streakSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    // backgroundColor is now applied dynamically via style prop
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
    // color is now applied dynamically via style prop
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  frequencyDetails: {
    fontSize: 12,
    marginTop: 2,
    // color is now applied dynamically via style prop
    opacity: 0.95,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: "600",
    // color is now applied dynamically via style prop
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 2,
    // color is now applied dynamically via style prop
    opacity: 0.95,
  },
  checkButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    // borderColor is now applied dynamically via style prop
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkButtonCompleted: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: "bold",
    // color is now applied dynamically via style prop
  },
});
