import { LinearGradient } from "node_modules/react-native-svg/lib/typescript";
import { DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors, // Spread default colors first
    // Then override or add custom ones
    primary: "#0F4D92", // Dark Blue
    accent: "#FF8C00", // Dark Orange
    background: "#FFFFFF", // Fallback solid background color
    surface: "#FFFFFF", // For card backgrounds, etc.
    text: "#333333", // Dark Gray for text
    secondaryText: "#3C3C43", // iOS secondary text color (opacity 92%)
    placeholder: "#6B6B6B", // Darker Gray for placeholders (was #A9A9A9)
    disabled: "#D3D3D3", // Light Gray for disabled elements
    error: "#D32F2F", // Darker Red for errors (was #FF3B30)
    success: "#34C759", // Standard iOS success green
    notification: "#FF2D55", // A bright pink/red for notifications
    contrastPrimary: "#FFFFFF", // White text on primary blue
    contrastAccent: "#FFFFFF", // White text on accent orange
    outline: "#CCCCCC", // Added a general outline color
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    titleRegular: "Quicksand_400Regular",
    titleMedium: "Quicksand_500Medium",
    titleSemibold: "Quicksand_600SemiBold",
    titleBold: "Quicksand_700Bold",
  },
};
