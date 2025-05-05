import React from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import {
  VictoryLine,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryScatter,
  VictoryArea,
} from "victory-native";

interface WeeklyChartProps {
  dailyCompletions: Record<string, number>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  dailyCompletions = {},
}) => {
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
              tickLabels: { fontSize: 12, padding: 5, fill: "#0F4D92" },
              grid: { stroke: "rgba(15, 77, 146, 0.1)" },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 12, padding: 5, fill: "#0F4D92" },
              grid: { stroke: "rgba(15, 77, 146, 0.1)" },
            }}
          />
          <VictoryArea
            data={chartData}
            x="day"
            y="completions"
            style={{
              data: {
                fill: "rgba(15, 77, 146, 0.1)",
                stroke: "#0F4D92",
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
          <VictoryScatter
            data={chartData}
            x="day"
            y="completions"
            size={6}
            style={{
              data: {
                fill: "#fff",
                stroke: "#0F4D92",
                strokeWidth: 2,
              },
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    height: 220,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    width: Dimensions.get("window").width - 64,
  },
  errorText: {
    color: "#888",
    fontSize: 14,
  },
});
