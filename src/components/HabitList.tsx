import React, { useCallback, useState, useMemo } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity, // Import TouchableOpacity
} from "react-native";
import { Habit } from "../types/habit";
import { HabitCard } from "./HabitCard";
import { theme } from "../constants/theme"; // Import theme
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons

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
  const [showCompletedHabits, setShowCompletedHabits] = useState(false); // State for completed habits visibility

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

  const renderSectionHeader = (title: string, isCompletedSection?: boolean) => (
    <TouchableOpacity
      onPress={() => {
        if (isCompletedSection) {
          setShowCompletedHabits(!showCompletedHabits);
        }
      }}
      disabled={!isCompletedSection} // Disable press for non-completed sections
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {isCompletedSection && completedHabits.length > 0 && (
        <MaterialCommunityIcons
          name={showCompletedHabits ? "chevron-up" : "chevron-down"}
          size={24}
          color="#555"
        />
      )}
    </TouchableOpacity>
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
        data={incompleteHabits} // Initially render only incomplete habits
        keyExtractor={(item) => `incomplete-${item.id}`}
        renderItem={({ item, index }) => {
          const showHeader = index === 0 && incompleteHabits.length > 0;
          return (
            <>
              {showHeader && renderSectionHeader("Active")}
              <HabitCard
                habit={item}
                onToggleComplete={onToggleComplete}
                onPress={onHabitPress ? () => onHabitPress(item) : undefined}
                selectedDate={selectedDate}
              />
            </>
          );
        }}
        ListHeaderComponent={() => {
          if (
            incompleteHabits.length === 0 &&
            completedHabits.length === 0 &&
            !loading
          ) {
            return <EmptyListComponent />;
          }
          return null;
        }}
        ListFooterComponent={() => (
          <>
            {completedHabits.length > 0 &&
              renderSectionHeader("Completed", true)}
            {showCompletedHabits &&
              completedHabits.map((item) => (
                <HabitCard
                  key={`completed-${item.id}`}
                  habit={item}
                  onToggleComplete={onToggleComplete}
                  onPress={onHabitPress ? () => onHabitPress(item) : undefined}
                  selectedDate={selectedDate}
                />
              ))}
          </>
        )}
        contentContainerStyle={
          incompleteHabits.length === 0 && completedHabits.length === 0
            ? { flex: 1 }
            : undefined
        }
        // Remove ListEmptyComponent from here as it's handled in ListHeaderComponent
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
    backgroundColor: theme.colors.background, // Use theme background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.text, // Use theme text color for better contrast
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 20,
    color: theme.colors.text, // Use theme text color
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.secondaryText, // Use theme secondary text color
    textAlign: "center",
    maxWidth: "80%",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.background, // Match background
    flexDirection: "row", // Align title and icon
    justifyContent: "space-between", // Space between title and icon
    alignItems: "center", // Center items vertically
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold, // Use Quicksand Medium
    fontSize: 16,
    // fontWeight: "600", // fontWeight is part of fontFamily now
    color: theme.colors.text, // Use theme text color
  },
});
