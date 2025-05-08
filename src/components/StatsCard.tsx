import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
    padding: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  value: {
    fontFamily: theme.fonts.titleBold,
    fontSize: 28,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
});
