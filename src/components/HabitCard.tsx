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
    default: // Could be 'monthly' or other types if added
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

  // const baseBackgroundColor = React.useMemo(() => { // No longer needed for card background
  //   // Use the habit's color, or a default from the theme, and convert it to a pastel shade
  //   return toPastelColor(habit.color || theme.colors.primary);
  // }, [habit.color]);

  // const completedBackgroundColor = "#D3D3D3"; // No longer needed for card background

  const actualCardBackgroundColor = "#FFFFFF"; // Card background is now always white

  const handleToggleCompletion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newCompletedStatus = !isCompletedForSelectedDate;
    onToggleComplete(habit.id, newCompletedStatus);
    // setIsContentVisible(!newCompletedStatus); // Removed: content visibility no longer tied to completion
  };

  const handleCardPress = () => {
    // if (isCompletedForSelectedDate) { // Removed: completed card no longer toggles content
    //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    //   setIsContentVisible((prev) => !prev);
    // } else if (onPress) {
    //   onPress();
    // }
    if (onPress) {
      // Press action is now always the default onPress (e.g., navigate to details)
      onPress();
    }
  };

  const cardTextColor = getContrastTextColor(actualCardBackgroundColor); // Will be dark text on white
  const originalHabitAccentColor = habit.color || theme.colors.primary;

  // Calculate a color derived from the habit's accent color that ensures visibility on a white background
  let accentDerivedColorForWhiteBg = originalHabitAccentColor;
  const accentContrastWithWhite = calculateContrastRatio(
    originalHabitAccentColor,
    "#FFFFFF"
  );

  if (accentContrastWithWhite < 3.0) {
    // WCAG AA minimum for UI components/graphical objects
    const darkerAccent = darkenColor(originalHabitAccentColor, 0.4); // Try darkening
    const darkerAccentContrastWithWhite = calculateContrastRatio(
      darkerAccent,
      "#FFFFFF"
    );

    if (darkerAccentContrastWithWhite >= 3.0) {
      accentDerivedColorForWhiteBg = darkerAccent;
    } else {
      // Fallback to a theme color known for good contrast on surfaces
      accentDerivedColorForWhiteBg = DefaultTheme.colors.onSurface;
    }
  }

  const colorIndicatorBackgroundColor = accentDerivedColorForWhiteBg;
  const determinedIconColor = accentDerivedColorForWhiteBg; // For detail icons

  const checkmarkIconColor = getContrastTextColor(originalHabitAccentColor); // For the checkmark on the colored button

  // const shouldShowContent = !isCompletedForSelectedDate || isContentVisible; // Simplified: content is always shown

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8}>
      <View
        style={[
          styles.card,
          { backgroundColor: actualCardBackgroundColor },
          {
            borderColor: isCompletedForSelectedDate
              ? theme.colors.disabled // Gray border for completed tasks
              : accentDerivedColorForWhiteBg, // Accent-derived border for active tasks
            borderWidth: 1.2, // Apply border width consistently
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.mainContent}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: colorIndicatorBackgroundColor },
                ]}
              />
              <Text style={[styles.title, { color: cardTextColor }]}>
                {habit.name}
              </Text>
              {/* {isCompletedForSelectedDate && ( // Removed chevron icon
                <MaterialCommunityIcons
                  name={isContentVisible ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={cardTextColor}
                  style={styles.chevronIcon}
                />
              )} */}
            </View>

            {/* {shouldShowContent && ( // Content is now always shown */}
            <>
              {habit.description && (
                <Text
                  style={[styles.description, { color: cardTextColor }]}
                  numberOfLines={2}
                >
                  {habit.description}
                </Text>
              )}

              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name={frequencyInfo.icon}
                    size={20}
                    color={determinedIconColor}
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text
                      style={[styles.detailLabel, { color: cardTextColor }]}
                    >
                      {frequencyInfo.label}
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: cardTextColor }]}
                    >
                      {frequencyInfo.details}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color={determinedIconColor}
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text
                      style={[styles.detailLabel, { color: cardTextColor }]}
                    >
                      Current Streak
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: cardTextColor }]}
                    >
                      {habit.streak} Days
                    </Text>
                  </View>
                </View>
              </View>
            </>
            {/* )} */}
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                // When not completed, border uses derived color for contrast on white.
                // When completed, border uses original accent color (matching background).
                borderColor: isCompletedForSelectedDate
                  ? originalHabitAccentColor
                  : accentDerivedColorForWhiteBg,
                // When completed, background is original accent color. Otherwise, transparent.
                backgroundColor: isCompletedForSelectedDate
                  ? originalHabitAccentColor
                  : "transparent",
              },
            ]}
            onPress={handleToggleCompletion} // Changed from handleToggle
          >
            {isCompletedForSelectedDate && (
              <Text style={[styles.checkIcon, { color: checkmarkIconColor }]}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    // backgroundColor: "#FFFFFF", // Explicitly white, though set by actualCardBackgroundColor
    // // Add shadow for floating effect
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 2,
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
    alignItems: "center", // Align items vertically
    marginBottom: 4,
  },
  colorIndicator: {
    // Added style for the color indicator
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 18,
    color: theme.colors.text, // Ensure high contrast
  },
  chevronIcon: {
    // Added style
    marginLeft: 8,
  },
  description: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
    color: theme.colors.text, // Ensure high contrast
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Align items to the start if they have different text lines
    marginTop: 8,
    gap: 12, // Gap between detail items
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // Allow items to shrink if space is limited
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontFamily: theme.fonts.semibold, // Use Inter Semibold
    fontSize: 13,
    // fontWeight: "600", // fontWeight is part of fontFamily now
    opacity: 0.9,
    color: theme.colors.text, // Ensure high contrast
  },
  detailValue: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    color: theme.colors.text, // Ensure high contrast
  },
  checkButton: {
    height: 30,
    width: 30,
    borderRadius: 15, // Circular
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16, // Spacing from main content
  },
  checkIcon: {
    fontFamily: theme.fonts.bold, // Use Inter Bold for checkmark
    fontSize: 18,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    // Color is dynamically set based on contrast with button background
  },
});
