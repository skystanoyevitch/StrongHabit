import React, { useCallback, useState } from "react";
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
  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);

      // Call the refresh function
      const refreshPromise = onRefresh();

      // Wait for the refresh function to complete
      Promise.resolve(refreshPromise).finally(() => {
        setRefreshing(false);
      });
    }
  }, [onRefresh]);

  // Component for empty state
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Habits Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to create your first habit
      </Text>
    </View>
  );

  // Main render function completion
  return (
    <View style={styles.container}>
      {loading && habits.length === 0 ? (
        // Show loader when loading and no items
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      ) : (
        // Show the FlatList when not loading or when we have items
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onToggleComplete={onToggleComplete}
              onPress={onHabitPress ? () => onHabitPress(item) : undefined}
            />
          )}
          contentContainerStyle={habits.length === 0 ? { flex: 1 } : undefined}
          ListEmptyComponent={EmptyListComponent}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            ) : undefined
          }
        />
      )}
    </View>
  );

  // The rest of the component will follow
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
});
