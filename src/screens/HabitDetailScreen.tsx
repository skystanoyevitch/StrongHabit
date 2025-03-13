import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Habit } from "../types/habit";

export default function HabitDetailScreen({ route }: any) {
  const { habit } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>
      <Text style={styles.description}>{habit.description}</Text>
      {/* Add more habit details here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginTop: 8,
  },
});
