import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Alert, Text } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation"; // Adjust the import path as necessary
import { useHabits } from "../hooks/useHabits";
import { HabitList } from "../components/HabitList";
import { Habit } from "../types/habit";
import { StorageService } from "../utils/storage";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "../components/AnimatedTitle";

export default function HomeScreen() {
  // Get habits data and operations from our custom hook
  const { habits, loading, error, refreshHabits } = useHabits();
  const storageService = StorageService.getInstance();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Refresh habits when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshHabits();

      return () => {
        // Cleanup if needed
      };
    }, [refreshHabits])
  );

  // Effect to initialize storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
      } catch (err) {
        console.error("Failed to initialize storage:", err);
        Alert.alert(
          "Initialization Error",
          "There was a problem loading your habits. Please try again."
        );
      }
    };

    initializeStorage();
  }, []);

  // Handle habit completion toggle
  const handleToggleComplete = useCallback(
    async (habitId: string, completed: boolean) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const habit = habits.find((h) => h.id === habitId);

        if (!habit) return;

        await storageService.updateHabitCompletion(habitId, today, completed);
        refreshHabits();
      } catch (err) {
        console.error("Failed to toggle habit completion:", err);
        Alert.alert(
          "Update Error",
          "Failed to update habit status. Please try again."
        );
      }
    },
    [habits, storageService, refreshHabits]
  );

  // Handle navigation to habit detail screen
  const handleHabitPress = useCallback(
    (habit: Habit) => {
      navigation.navigate("HabitDetail", { habit });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedTitle text="Today's Habits" />
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
    padding: 16,
  },
});
