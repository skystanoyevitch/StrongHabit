import React from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";

interface WeeklyChartProps {
  dailyCompletions: Record<string, number>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  dailyCompletions = {}, // Default value to prevent errors
}) => {
  // Make sure we have all days represented
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Format data for Victory
  const chartData = days.map((day) => ({
    day,
    completions: dailyCompletions[day] || 0,
  }));

  try {
    return (
      <View style={styles.container}>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          width={Dimensions.get("window").width - 64}
          height={220}
        >
          <VictoryAxis
            tickValues={days}
            style={{
              tickLabels: { fontSize: 12, padding: 5 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 12, padding: 5 },
            }}
          />
          <VictoryBar
            data={chartData}
            x="day"
            y="completions"
            style={{
              data: {
                fill: "#007AFF",
              },
            }}
            animate={{
              duration: 500,
            }}
          />
        </VictoryChart>
      </View>
    );
  } catch (error) {
    console.error("Error rendering chart:", error);
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Unable to display chart</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  errorContainer: {
    height: 220,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    width: Dimensions.get("window").width - 64,
  },
  errorText: {
    color: "#888",
    fontSize: 14,
  },
});
