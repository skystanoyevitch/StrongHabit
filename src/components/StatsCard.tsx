import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "src/constants/theme";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff", // Light background color
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: theme.colors.outline, // More rounded corners
    padding: 16,
    // shadowColor: "#000", // Darker shadow color
    // shadowOffset: { width: 2, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  value: {
    fontFamily: theme.fonts.titleBold, // Use Quicksand Bold
    fontSize: 30,
    // fontWeight: "700", // fontWeight is part of fontFamily now
    color: "#0F4D92", // Updated to theme color
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    color: "#888",
  },
});
