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
import { theme } from "../constants/theme";
import {
  getCategoryFromKeywords,
  getCategoryColors,
  HabitCategoryType,
} from "../constants/habitColors";
import {
  lightenColor,
  darkenColor,
  getContrastTextColor,
  generateAccessibleColorPalette,
  getLuminance,
} from "../utils/colorUtils";
import {
  getHabitAccessibilityLabel,
  getAccessibilityHint,
  getAccessibilityProps,
} from "../utils/accessibilityUtils";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        icon: "calendar-blank" as const,
        label:
          habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1),
        details: "Scheduled",
      };
  }
};

// Get habit category based on the habit name and description
const determineHabitCategory = (habit: Habit): HabitCategoryType => {
  // If category is already set, use it
  if (habit.category) return habit.category;

  // Otherwise determine category from habit text
  const textForAnalysis = `${habit.name} ${habit.description || ""}`;
  return getCategoryFromKeywords(textForAnalysis);
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
  const [isContentVisible, setIsContentVisible] = React.useState(true);

  const isCompletedForSelectedDate = React.useMemo(() => {
    return habit.completionLogs.some(
      (log) => log.date.split("T")[0] === selectedDate && log.completed
    );
  }, [habit.completionLogs, selectedDate]);

  React.useEffect(() => {
    // When completion status changes, reset the content visibility
    setIsContentVisible(!isCompletedForSelectedDate);
  }, [isCompletedForSelectedDate]);

  const frequencyInfo = React.useMemo(() => getFrequencyInfo(habit), [habit]);

  // Determine base color - priority given to user's color choice with validation
  const baseColor = React.useMemo(() => {
    // If user has chosen a color, validate it first
    if (
      habit.color &&
      typeof habit.color === "string" &&
      habit.color.startsWith("#")
    ) {
      // Check if it's a valid hex color format (#RGB or #RRGGBB)
      if (/^#([0-9A-F]{3}){1,2}$/i.test(habit.color)) {
        return habit.color;
      }
    }

    // Otherwise, use category-based color
    const category = determineHabitCategory(habit);
    const categoryColors = getCategoryColors(category);
    return categoryColors.base;
  }, [habit]);

  // Generate a full color palette from the base color
  const colorPalette = React.useMemo(
    () => generateAccessibleColorPalette(baseColor),
    [baseColor]
  );

  // Apply different styling based on completion status
  const cardStyles = React.useMemo(() => {
    // For completed habits
    if (isCompletedForSelectedDate) {
      return {
        backgroundColor: "#F5F5F5", // Consistent light gray for completed
        accentColor: darkenColor(baseColor, 0.2), // Slightly darkened accent
        textColor: "#616161", // Dark gray for primary text
        secondaryTextColor: "#9E9E9E", // Medium gray for secondary text
        separatorColor: "rgba(0,0,0,0.05)", // Subtle separator
      };
    }
    // For incomplete habits - use color palette derived from user's color
    else {
      const bgColor = colorPalette.light; // Light version of user's color
      // Check if background is light enough for dark text
      const isLightBackground = getLuminance(bgColor) > 0.6;

      return {
        backgroundColor: bgColor,
        accentColor: baseColor, // User's original color for accent
        textColor: isLightBackground ? "#212121" : "#FFFFFF", // Ensure contrast with background
        secondaryTextColor: isLightBackground ? "#424242" : "#F5F5F5", // Secondary text with good contrast
        separatorColor: `${baseColor}20`, // Transparent version of accent color
      };
    }
  }, [isCompletedForSelectedDate, baseColor, colorPalette]);

  const handleToggleCompletion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newCompletedStatus = !isCompletedForSelectedDate;
    onToggleComplete(habit.id, newCompletedStatus);
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    }
  };

  // Ensure check button has proper contrast text/icon
  const checkButtonColor = isCompletedForSelectedDate
    ? cardStyles.accentColor
    : lightenColor(baseColor, 0.1); // Slightly lighter

  const checkmarkIconColor = getContrastTextColor(checkButtonColor);

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={0.95}
      style={styles.cardTouchable}
      {...getAccessibilityProps(
        getHabitAccessibilityLabel(
          habit.name,
          habit.streak,
          isCompletedForSelectedDate
        ),
        getAccessibilityHint("open habit details"),
        "button"
      )}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardStyles.backgroundColor,
            borderLeftColor: cardStyles.accentColor,
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
                    color: cardStyles.textColor,
                    opacity: isCompletedForSelectedDate ? 0.85 : 1,
                  },
                ]}
              >
                {habit.name}
              </Text>
            </View>

            <>
              {habit.description && (
                <Text
                  style={[
                    styles.description,
                    {
                      color: cardStyles.textColor,
                      opacity: isCompletedForSelectedDate ? 0.75 : 0.9,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {habit.description}
                </Text>
              )}

              <View
                style={[
                  styles.separator,
                  { backgroundColor: cardStyles.separatorColor },
                ]}
              />

              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name={frequencyInfo.icon}
                    size={18}
                    color={cardStyles.secondaryTextColor}
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
                          color: cardStyles.textColor,
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
                          color: cardStyles.secondaryTextColor,
                          opacity: isCompletedForSelectedDate ? 0.6 : 0.85,
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
                    color={cardStyles.secondaryTextColor}
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
                          color: cardStyles.textColor,
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
                          color: cardStyles.secondaryTextColor,
                          opacity: isCompletedForSelectedDate ? 0.6 : 0.85,
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
            {...getAccessibilityProps(
              `${
                isCompletedForSelectedDate
                  ? "Mark as not completed"
                  : "Mark as completed"
              }`,
              getAccessibilityHint(
                isCompletedForSelectedDate
                  ? "mark as not completed"
                  : "mark as completed"
              ),
              "checkbox"
            )}
            accessibilityState={{ checked: isCompletedForSelectedDate }}
          >
            {isCompletedForSelectedDate ? (
              <MaterialCommunityIcons
                name="check-bold"
                size={20}
                color={checkmarkIconColor}
              />
            ) : (
              <View
                style={[
                  styles.emptyCheckCircle,
                  { borderColor: checkmarkIconColor },
                ]}
              />
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4, // Border accent is set dynamically
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: "hidden",
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
    flex: 1, // Allow title to wrap and take available space
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
    maxWidth: "45%", // Prevent from taking too much space
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
    height: 38,
    width: 38,
    borderRadius: 19,
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
    flexDirection: "row",
    alignItems: "center",
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
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    marginVertical: 10,
  },
  emptyCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});
