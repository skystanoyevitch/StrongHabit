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
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  loading,
  onToggleComplete,
  onHabitPress,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Split habits into incomplete and complete for today
  const { incompleteHabits, completedHabits } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return habits.reduce(
      (acc, habit) => {
        const isCompletedToday = habit.completionLogs.some(
          (log) => log.date.split("T")[0] === today && log.completed
        );
        if (isCompletedToday) {
          acc.completedHabits.push(habit);
        } else {
          acc.incompleteHabits.push(habit);
        }
        return acc;
      },
      { incompleteHabits: [] as Habit[], completedHabits: [] as Habit[] }
    );
  }, [habits]);

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
          return (
            <>
              {isFirstCompleted &&
                completedHabits.length > 0 &&
                renderSectionHeader("Completed Today")}
              {index === 0 &&
                incompleteHabits.length > 0 &&
                renderSectionHeader("Today's Tasks")}
              <HabitCard
                habit={item}
                onToggleComplete={onToggleComplete}
                onPress={onHabitPress ? () => onHabitPress(item) : undefined}
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
    paddingVertical: 8,
    backgroundColor: "rgba(15, 77, 146, 0.05)",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F4D92",
  },
});
