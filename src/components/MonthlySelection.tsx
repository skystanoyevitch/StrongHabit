import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { theme } from "../constants/theme";

interface MonthlySelectionProps {
  selectedDays: number[];
  onDaySelect: (day: number) => void;
}

export const MonthlySelection: React.FC<MonthlySelectionProps> = ({
  selectedDays,
  onDaySelect,
}) => {
  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.selectedDay,
            ]}
            onPress={() => onDaySelect(day)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(day) && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedDayText: {
    color: theme.colors.contrastPrimary,
    fontFamily: theme.fonts.medium,
  },
});
