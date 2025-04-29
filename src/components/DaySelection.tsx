import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DayOfWeek, DAYS_OF_WEEK } from "../types/habit";

interface DaySelectionProps {
  selectedDays: DayOfWeek[];
  onDaySelect: (day: DayOfWeek) => void;
  disabled?: boolean;
}

export const DaySelection: React.FC<DaySelectionProps> = ({
  selectedDays,
  onDaySelect,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {DAYS_OF_WEEK.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selectedDays.includes(day) && styles.selectedDay,
          ]}
          onPress={() => !disabled && onDaySelect(day)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${day} ${
            selectedDays.includes(day) ? "selected" : "not selected"
          }`}
        >
          <Text
            style={[
              styles.dayText,
              selectedDays.includes(day) && styles.selectedDayText,
            ]}
          >
            {day.slice(0, 3).toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  selectedDay: {
    backgroundColor: "#007AFF",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
  },
});
