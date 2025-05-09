import { Platform } from "react-native";

/**
 * Generates appropriate accessibility labels for habit components
 */
export const getHabitAccessibilityLabel = (
  name: string,
  streak: number,
  isCompleted?: boolean
): string => {
  let label = `${name}, current streak ${streak} days`;

  if (isCompleted !== undefined) {
    label += isCompleted
      ? ", completed for today"
      : ", not completed for today";
  }

  return label;
};

/**
 * Generates appropriate accessibility hints for components
 */
export const getAccessibilityHint = (action: string): string => {
  return `Double tap to ${action}`;
};

/**
 * Formats a date for accessibility announcements
 */
export const formatDateForAccessibility = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Returns platform-specific accessibility props
 */
export const getAccessibilityProps = (
  label: string,
  hint?: string,
  role: "button" | "header" | "text" | "checkbox" | "radio" | "none" = "none"
) => {
  if (Platform.OS === "ios") {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };
  } else {
    // Android has slightly different naming for some properties
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };
  }
};

/**
 * Generates accessibility announcement for achievements
 */
export const getAchievementAccessibilityLabel = (
  title: string,
  description: string,
  isUnlocked: boolean
): string => {
  return `${title}. ${description}. ${
    isUnlocked ? "Achievement unlocked" : "Achievement locked"
  }`;
};
