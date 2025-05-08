import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ColorValue,
} from "react-native";
import { Habit } from "../types/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { DefaultTheme } from "react-native-paper";
import { getContrastTextColor } from "../utils/colorUtils";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper function to darken a hex color
const darkenColor = (
  color: ColorValue | undefined,
  amount: number = 0.2
): string => {
  let col = String(color);
  if (!col || !col.startsWith("#")) {
    return "#0A3A70"; // Darker default blue if color is invalid
  }
  col = col.slice(1); // Remove #
  if (col.length === 3) {
    // Expand shorthand hex
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
  }
  if (col.length !== 6) {
    return "#0A3A70"; // Return default if not a valid 6-digit hex after expansion
  }
  let r = parseInt(col.substring(0, 2), 16);
  let g = parseInt(col.substring(2, 4), 16);
  let b = parseInt(col.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
};

// Helper function to lighten a hex color
const lightenColor = (
  color: ColorValue | undefined,
  amount: number = 0.2
): string => {
  let col = String(color);
  if (!col || !col.startsWith("#")) {
    return "#F0F5FF"; // Very light default blue if color is invalid
  }
  col = col.slice(1); // Remove #
  if (col.length === 3) {
    // Expand shorthand hex
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
  }
  if (col.length !== 6) {
    return "#F0F5FF"; // Return default if not a valid 6-digit hex after expansion
  }

  // Convert to RGB
  let r = parseInt(col.substring(0, 2), 16);
  let g = parseInt(col.substring(2, 4), 16);
  let b = parseInt(col.substring(4, 6), 16);

  // Create a much lighter pastel - higher values (0.9) make it very light but still maintain color identity
  r = Math.min(255, Math.round(r + (255 - r) * (amount * 0.9)));
  g = Math.min(255, Math.round(g + (255 - g) * (amount * 0.9)));
  b = Math.min(255, Math.round(b + (255 - b) * (amount * 0.9)));

  // Convert back to hex
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
};

// Helper function to calculate luminance (WCAG formula)
const calculateLuminance = (hexColor: string): number => {
  const hex = hexColor.replace("#", "");
  const r_srgb = parseInt(hex.substring(0, 2), 16) / 255;
  const g_srgb = parseInt(hex.substring(2, 4), 16) / 255;
  const b_srgb = parseInt(hex.substring(4, 6), 16) / 255;

  const r =
    r_srgb <= 0.03928
      ? r_srgb / 12.92
      : Math.pow((r_srgb + 0.055) / 1.055, 2.4);
  const g =
    g_srgb <= 0.03928
      ? g_srgb / 12.92
      : Math.pow((g_srgb + 0.055) / 1.055, 2.4);
  const b =
    b_srgb <= 0.03928
      ? b_srgb / 12.92
      : Math.pow((b_srgb + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Helper function to calculate contrast ratio
const calculateContrastRatio = (color1: string, color2: string): number => {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const L1 = Math.max(lum1, lum2);
  const L2 = Math.min(lum1, lum2);
  return (L1 + 0.05) / (L2 + 0.05);
};

// Helper function to get frequency information
const getFrequencyInfo = (habit: Habit) => {
  const { frequency, selectedDays, monthlyDays } = habit;
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
    case "monthly":
      const monthlyDaysCount = monthlyDays?.length ?? 0;
      return {
        icon: "calendar-month" as const,
        label: "Monthly",
        details: `${monthlyDaysCount} ${
          monthlyDaysCount === 1 ? "day" : "days"
        } per month`,
      };
    default:
      return {
        icon: "calendar-blank" as const, // Generic calendar icon
        label:
          habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1),
        details: "Scheduled", // Generic detail
      };
  }
};

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onPress?: () => void;
  selectedDate: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onPress,
  selectedDate,
}) => {
  const [isContentVisible, setIsContentVisible] = React.useState(true); // Content is always visible by default

  const isCompletedForSelectedDate = React.useMemo(() => {
    return habit.completionLogs.some(
      (log) => log.date.split("T")[0] === selectedDate && log.completed
    );
  }, [habit.completionLogs, selectedDate]);

  React.useEffect(() => {
    // When completion status changes (e.g. date selected changes, or habit data updates),
    // reset the content visibility: collapsed if completed, expanded if not.
    setIsContentVisible(!isCompletedForSelectedDate);
  }, [isCompletedForSelectedDate]);

  const frequencyInfo = React.useMemo(() => getFrequencyInfo(habit), [habit]);

  // Get base card color from habit color or default
  const cardColor = habit.color || theme.colors.primary;

  // For completed habits, use a gradient from light grey to white instead of a flat color
  const cardBackgroundColor = isCompletedForSelectedDate
    ? "#f5f5f5" // Light grey for completed habits
    : lightenColor(cardColor, 0.85); // Light pastel for incomplete habits

  // Determine text color based on background color contrast
  const cardTextColor = isCompletedForSelectedDate
    ? "#757575" // Darker grey text for completed habits
    : getContrastTextColor(cardBackgroundColor);

  // Define gradient colors for a subtle gradient effect on the card background
  const gradientStartColor = isCompletedForSelectedDate
    ? "#f0f0f0"
    : lightenColor(cardColor, 0.9);

  const gradientEndColor = isCompletedForSelectedDate
    ? "#ffffff"
    : lightenColor(cardColor, 0.7);

  const handleToggleCompletion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newCompletedStatus = !isCompletedForSelectedDate;
    onToggleComplete(habit.id, newCompletedStatus);
  };

  const handleCardPress = () => {
    if (onPress) {
      // Press action is now always the default onPress (e.g., navigate to details)
      onPress();
    }
  };

  // For the checkmark button - make it more visually appealing
  const checkButtonColor = isCompletedForSelectedDate
    ? cardColor // Use the original card color for completed status
    : lightenColor(cardColor, 0.3); // Lighter than card if not completed

  const checkmarkIconColor = getContrastTextColor(checkButtonColor);

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={0.95}
      style={styles.cardTouchable}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBackgroundColor,
            borderLeftColor: cardColor,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.mainContent}>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    color: cardTextColor,
                    opacity: isCompletedForSelectedDate ? 0.8 : 1,
                  },
                ]}
              >
                {habit.name}
              </Text>

              {habit.streak > 0 && (
                <View
                  style={[
                    styles.streakBadge,
                    {
                      backgroundColor: isCompletedForSelectedDate
                        ? "#bdbdbd"
                        : cardColor,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={12}
                    color="#ffffff"
                  />
                  <Text style={styles.streakText}>{habit.streak}</Text>
                </View>
              )}
            </View>

            <>
              {habit.description && (
                <Text
                  style={[
                    styles.description,
                    {
                      color: cardTextColor,
                      opacity: isCompletedForSelectedDate ? 0.7 : 0.85,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {habit.description}
                </Text>
              )}

              <View style={styles.separator} />

              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name={frequencyInfo.icon}
                    size={18}
                    color={cardTextColor}
                    style={[
                      styles.detailIcon,
                      {
                        opacity: isCompletedForSelectedDate ? 0.7 : 0.9,
                      },
                    ]}
                  />
                  <View>
                    <Text
                      style={[
                        styles.detailLabel,
                        {
                          color: cardTextColor,
                          opacity: isCompletedForSelectedDate ? 0.8 : 1,
                        },
                      ]}
                    >
                      {frequencyInfo.label}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: cardTextColor,
                          opacity: isCompletedForSelectedDate ? 0.6 : 0.8,
                        },
                      ]}
                    >
                      {frequencyInfo.details}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={18}
                    color={cardTextColor}
                    style={[
                      styles.detailIcon,
                      {
                        opacity: isCompletedForSelectedDate ? 0.7 : 0.9,
                      },
                    ]}
                  />
                  <View>
                    <Text
                      style={[
                        styles.detailLabel,
                        {
                          color: cardTextColor,
                          opacity: isCompletedForSelectedDate ? 0.8 : 1,
                        },
                      ]}
                    >
                      Current Streak
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: cardTextColor,
                          opacity: isCompletedForSelectedDate ? 0.6 : 0.8,
                        },
                      ]}
                    >
                      {habit.streak} {habit.streak === 1 ? "Day" : "Days"}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: checkButtonColor,
                transform: [{ scale: isCompletedForSelectedDate ? 1 : 0.95 }],
              },
            ]}
            onPress={handleToggleCompletion}
          >
            {isCompletedForSelectedDate ? (
              <MaterialCommunityIcons
                name="check-bold"
                size={20}
                color={checkmarkIconColor}
              />
            ) : (
              <View style={styles.emptyCheckCircle} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4, // Border accent is set dynamically
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ translateY: 0 }], // Base for animation
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    // flex: 1, // Allow title to wrap and take available space
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20, // Improved line spacing
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 16, // Increased spacing between detail sections
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Align to top
    flexShrink: 1,
    maxWidth: '45%', // Prevent from taking too much space
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2, // Better align with text
  },
  detailLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
  },
  detailValue: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  checkButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  streakText: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)', // More subtle separator
    marginVertical: 10,
  },
  emptyCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});
