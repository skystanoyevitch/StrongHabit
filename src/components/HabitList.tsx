import React, { useCallback, useState, useMemo } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Habit } from "../types/habit";
import { HabitCard } from "./HabitCard";

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onHabitPress?: (habit: Habit) => void;
  onRefresh?: () => void;
  selectedDate: string; // Add selectedDate prop
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  loading,
  onToggleComplete,
  onHabitPress,
  onRefresh,
  selectedDate, // Use selectedDate prop
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Split habits into incomplete and complete for the selected date
  const { incompleteHabits, completedHabits } = useMemo(() => {
    // Use selectedDate passed via props
    return habits.reduce(
      (acc, habit) => {
        const isCompletedForSelectedDate = habit.completionLogs.some(
          (log) => log.date.split("T")[0] === selectedDate && log.completed
        );
        if (isCompletedForSelectedDate) {
          acc.completedHabits.push(habit);
        } else {
          acc.incompleteHabits.push(habit);
        }
        return acc;
      },
      { incompleteHabits: [] as Habit[], completedHabits: [] as Habit[] }
    );
  }, [habits, selectedDate]); // Add selectedDate dependency

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false);
      });
    }
  }, [onRefresh]);

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Habits Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to create your first habit
      </Text>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F4D92" />
        <Text style={styles.loadingText}>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...incompleteHabits, ...completedHabits]}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isFirstCompleted = index === incompleteHabits.length;
          const sectionTitle = isFirstCompleted ? "Completed" : "Pending"; // More generic title
          const showHeader =
            (isFirstCompleted && completedHabits.length > 0) ||
            (index === 0 && incompleteHabits.length > 0);

          return (
            <>
              {showHeader && renderSectionHeader(sectionTitle)}
              <HabitCard
                habit={item}
                onToggleComplete={onToggleComplete}
                onPress={onHabitPress ? () => onHabitPress(item) : undefined}
                selectedDate={selectedDate} // Pass selectedDate down
              />
            </>
          );
        }}
        contentContainerStyle={habits.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={EmptyListComponent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0F4D92"]}
              tintColor="#0F4D92"
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // Softer background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#f8f8f8", // Match background
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
});
