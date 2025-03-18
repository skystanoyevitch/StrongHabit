import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface WeeklyChartProps {
  dailyCompletions: Record<string, number>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  dailyCompletions,
}) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data = {
    labels: days,
    datasets: [
      {
        data: days.map((day) => dailyCompletions[day] || 0),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={Dimensions.get("window").width - 64}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
