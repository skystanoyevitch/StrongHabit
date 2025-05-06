import React from "react";
import { View, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HabitForm } from "../components/HabitForm";
import { StorageService } from "../utils/storage";
import { Habit } from "../types/habit";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { theme } from "../constants/theme"; // Import theme

export default function AddHabitScreen() {
  const navigation = useNavigation();
  const storageService = StorageService.getInstance();

  // Handle form submission
  const handleSubmit = async (
    habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
  ) => {
    try {
      await storageService.addHabit(habitData);
      Alert.alert(
        "Habit Created",
        "Your new habit has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home" as never),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create habit:", error);
      Alert.alert("Error", "There was a problem creating your habit");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HabitForm onSubmit={handleSubmit} onCancel={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme background
  },
  title: {
    fontFamily: theme.fonts.titleBold, // Use Quicksand Bold for title
    fontSize: 24,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    color: theme.colors.text, // Use theme text color
    marginBottom: 20,
    textAlign: "center",
  },
});
