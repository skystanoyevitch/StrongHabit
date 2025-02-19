import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useHabits } from "../hooks/useHabits";
import { HabitList } from "../components/HabitList";
import { Habit } from "../types/habit";
import { StorageService } from "../utils/storage";

export default function HomeScreen() {
  // Get habits data and operations from our custom hook
  const { habits, loading, error, refreshHabits } = useHabits();
  const storageService = StorageService.getInstance();
  const navigation = useNavigation();

  // Effect to initialize storage
  useEffect(() => {
    storageService.initialize().catch((err) => {
      console.error("Failed to initialize storage:", err);
      Alert.alert("Error", "There was a problem loading your habits");
    });
  }, []);

  // Handle habit completion toggle
  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const habit = habits.find((h) => h.id === habitId);

      if (!habit) return;

      // Update local storage with new completion status
      await storageService.updateHabitCompletion(habitId, today, completed);

      // Refresh habits to reflect changes
      refreshHabits();
    } catch (err) {
      console.error("Failed to toggle habit completion:", err);
      Alert.alert("Error", "Failed to update habit status");
    }
  };

  // Handle navigation to habit detail screen
  const handleHabitPress = (habit: Habit) => {
    // We'll implement this navigation later
    // navigation.navigate('HabitDetail', { habitId: habit.id });
    Alert.alert(
      "Coming Soon",
      "Habit details will be available in a future update"
    );
  };

  // console.log(navigation.getState());
  return (
    <SafeAreaView style={styles.container}>
      <HabitList
        habits={habits}
        loading={loading}
        onToggleComplete={handleToggleComplete}
        onHabitPress={handleHabitPress}
        onRefresh={refreshHabits}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
});
