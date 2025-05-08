import { ColorValue } from "react-native";

// Define category colors based on color theory and psychological associations
export type HabitCategoryType =
  | "wellness"
  | "productivity"
  | "personal"
  | "social"
  | "finance"
  | "creativity"
  | "learning";

// Color palette structure for each category
export interface ColorPalette {
  base: string; // Main vibrant color for buttons and accents
  light: string; // Light version for backgrounds
  dark: string; // Dark version for text on light backgrounds
  text: string; // Text color to use on the base color
  analogous: string; // Related color for visual interest
}

// Color palettes based on color theory (60-30-10 rule, complementary and analogous colors)
export const habitCategoryColors: Record<HabitCategoryType, ColorPalette> = {
  wellness: {
    base: "#2E7D32", // Forest Green - associated with health, renewal, and growth
    light: "#E8F5E9", // Very light mint for backgrounds
    dark: "#1B5E20", // Deep forest green for text
    text: "#FFFFFF", // White text on base color
    analogous: "#81C784", // Light green for accents
  },
  productivity: {
    base: "#1565C0", // Royal Blue - associated with focus, efficiency, and clarity
    light: "#E3F2FD", // Very light blue for backgrounds
    dark: "#0D47A1", // Deep blue for text
    text: "#FFFFFF", // White text on base color
    analogous: "#64B5F6", // Light blue for accents
  },
  personal: {
    base: "#8E24AA", // Purple - associated with personal growth, wisdom, and ambition
    light: "#F3E5F5", // Very light lavender for backgrounds
    dark: "#4A148C", // Deep purple for text
    text: "#FFFFFF", // White text on base color
    analogous: "#CE93D8", // Lavender for accents
  },
  social: {
    base: "#D81B60", // Pink - associated with relationships, compassion, and connection
    light: "#FCE4EC", // Very light pink for backgrounds
    dark: "#880E4F", // Deep pink for text
    text: "#FFFFFF", // White text on base color
    analogous: "#F48FB1", // Light pink for accents
  },
  finance: {
    base: "#00695C", // Teal - associated with wealth, stability, and growth
    light: "#E0F2F1", // Very light teal for backgrounds
    dark: "#004D40", // Deep teal for text
    text: "#FFFFFF", // White text on base color
    analogous: "#4DB6AC", // Light teal for accents
  },
  creativity: {
    base: "#F57C00", // Orange - associated with creativity, enthusiasm, and energy
    light: "#FFF3E0", // Very light orange for backgrounds
    dark: "#E65100", // Deep orange for text
    text: "#FFFFFF", // White text on base color
    analogous: "#FFB74D", // Light orange for accents
  },
  learning: {
    base: "#0277BD", // Light Blue - associated with knowledge, serenity, and trust
    light: "#E1F5FE", // Very light blue for backgrounds
    dark: "#01579B", // Deep light blue for text
    text: "#FFFFFF", // White text on base color
    analogous: "#4FC3F7", // Lighter blue for accents
  },
};

// Default colors to use if no category is specified
export const defaultCategoryColors: ColorPalette =
  habitCategoryColors.productivity;

// Function to get colors based on habit category
export const getCategoryColors = (
  category?: HabitCategoryType
): ColorPalette => {
  if (!category || !habitCategoryColors[category]) {
    return defaultCategoryColors;
  }
  return habitCategoryColors[category];
};

// Utility to get appropriate color palette for habits based on name/description keywords
export const getCategoryFromKeywords = (text: string): HabitCategoryType => {
  text = text.toLowerCase();

  // Keywords for each category - extend as needed
  const keywords: Record<HabitCategoryType, string[]> = {
    wellness: [
      "health",
      "workout",
      "exercise",
      "yoga",
      "sleep",
      "water",
      "meditation",
      "diet",
      "nutrition",
      "gym",
    ],
    productivity: [
      "work",
      "task",
      "project",
      "deadline",
      "goal",
      "organize",
      "clean",
      "focus",
      "efficiency",
      "time",
    ],
    personal: [
      "journal",
      "gratitude",
      "reflect",
      "growth",
      "mindfulness",
      "self",
      "hobby",
      "habit",
      "routine",
    ],
    social: [
      "friend",
      "family",
      "call",
      "text",
      "meet",
      "social",
      "relationship",
      "connect",
      "network",
      "date",
    ],
    finance: [
      "money",
      "save",
      "budget",
      "invest",
      "finance",
      "expense",
      "spending",
      "banking",
      "debt",
      "income",
    ],
    creativity: [
      "art",
      "music",
      "write",
      "create",
      "draw",
      "paint",
      "design",
      "craft",
      "creative",
      "photography",
    ],
    learning: [
      "read",
      "book",
      "study",
      "learn",
      "course",
      "class",
      "skill",
      "language",
      "practice",
      "knowledge",
    ],
  };

  // Check which category has the most matches in the text
  const matches: Record<HabitCategoryType, number> = {
    wellness: 0,
    productivity: 0,
    personal: 0,
    social: 0,
    finance: 0,
    creativity: 0,
    learning: 0,
  };

  Object.entries(keywords).forEach(([category, words]) => {
    words.forEach((word) => {
      if (text.includes(word)) {
        matches[category as HabitCategoryType] += 1;
      }
    });
  });

  // Find category with most matches
  let bestMatch: HabitCategoryType = "personal";
  let maxMatches = 0;

  Object.entries(matches).forEach(([category, count]) => {
    if (count > maxMatches) {
      maxMatches = count;
      bestMatch = category as HabitCategoryType;
    }
  });

  return bestMatch;
};

// Enhanced color utility functions
export const adjustColor = (color: string, amount: number): string => {
  // Makes a color lighter (positive amount) or darker (negative amount)
  const clamp = (num: number) => Math.min(255, Math.max(0, num));

  if (!color || !color.startsWith("#")) {
    return color;
  }

  let hex = color.slice(1);

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const num = parseInt(hex, 16);
  let r = clamp(((num >> 16) & 255) + amount);
  let g = clamp(((num >> 8) & 255) + amount);
  let b = clamp((num & 255) + amount);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Calculate contrast ratio between two colors (WCAG formula)
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    let rgb = parseInt(color.replace("#", ""), 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;

    // Convert to sRGB
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply gamma correction
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  // Return contrast ratio
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Get accessible text color for a background (ensures 4.5:1 contrast ratio)
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const white = "#FFFFFF";
  const black = "#212121"; // Not pure black for softer contrast

  const contrastWithWhite = getContrastRatio(backgroundColor, white);
  const contrastWithBlack = getContrastRatio(backgroundColor, black);

  // WCAG AA requires 4.5:1 contrast for normal text
  return contrastWithWhite >= contrastWithBlack ? white : black;
};
