import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
// Remove Calendar import
// import { Calendar, DateData } from "react-native-calendars";
import { RootStackParamList } from "../types/navigation";
import { useHabits } from "../hooks/useHabits";
import { HabitList } from "../components/HabitList";
import { DayOfWeek, Habit } from "../types/habit"; // Import DayOfWeek
import { StorageService } from "../utils/storage";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "../components/AnimatedTitle";
import Icon from "react-native-vector-icons/Ionicons"; // Import Icon

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => new Date().toISOString().split("T")[0];

// Helper function to format date string (YYYY-MM-DD) to a readable format
const formatDateReadable = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00"); // Avoid timezone issues
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to add/subtract days from a date string
const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

// Helper function to get the day of the week (lowercase) from a date string
const getDayOfWeek = (dateString: string): DayOfWeek => {
  const date = new Date(dateString + "T00:00:00");
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
};

export default function HomeScreen() {
  // Get habits data and operations from our custom hook
  const { habits, loading, error, refreshHabits } = useHabits();
  const storageService = StorageService.getInstance();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  ); // State for selected date

  // Refresh habits when screen comes into focus or selectedDate changes
  useFocusEffect(
    React.useCallback(() => {
      refreshHabits(); // Refresh all habits data

      return () => {
        // Cleanup if needed
      };
    }, [refreshHabits]) // Keep dependency only on refreshHabits if it fetches all data
  );

  // Effect to initialize storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
        // Refresh habits after storage is initialized
        refreshHabits();
      } catch (err) {
        console.error("Failed to initialize storage:", err);
        Alert.alert(
          "Initialization Error",
          "There was a problem loading your habits. Please try again."
        );
      }
    };

    initializeStorage();
    // Intentionally run only once on mount, storageService and refreshHabits are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle habit completion toggle for the selected date
  const handleToggleComplete = useCallback(
    async (habitId: string, completed: boolean) => {
      try {
        // Use the selectedDate state here
        await storageService.updateHabitCompletion(
          habitId,
          selectedDate,
          completed
        );
        // Optimistically update UI or refresh all habits
        // For simplicity, refreshing all habits ensures consistency
        refreshHabits();
      } catch (err) {
        console.error("Failed to toggle habit completion:", err);
        Alert.alert(
          "Update Error",
          "Failed to update habit status. Please try again."
        );
      }
    },
    [storageService, refreshHabits, selectedDate] // Add selectedDate to dependencies
  );

  // Handle navigation to habit detail screen
  const handleHabitPress = useCallback(
    (habit: Habit) => {
      navigation.navigate("HabitDetail", { habit });
    },
    [navigation]
  );

  // Date navigation handlers
  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prevDate) => addDays(prevDate, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDateString());
  }, []);

  // Filter habits to show only those active on the selected date
  // And determine their completion status for that specific date
  const habitsForSelectedDate = habits
    .filter((habit) => {
      // Filter out archived habits
      if (habit.archivedAt) {
        return false;
      }

      // Check frequency
      if (habit.frequency === "daily") {
        return true; // Daily habits are always shown (unless archived)
      }

      if (habit.frequency === "weekly") {
        const selectedDayOfWeek = getDayOfWeek(selectedDate);
        return habit.selectedDays?.includes(selectedDayOfWeek) ?? false;
      }

      // Add logic for other frequencies if needed
      return false; // Default to not showing if frequency is unknown/unhandled
    })
    .map((habit) => {
      // Check completion status for the selectedDate by finding the log entry
      // Ensure date comparison is robust (comparing YYYY-MM-DD strings)
      const logEntry = habit.completionLogs?.find(
        (log) => log.date.split("T")[0] === selectedDate
      );
      const completed = logEntry ? logEntry.completed : false;
      return { ...habit, completed }; // Add a temporary 'completed' field for the UI
    });

  // Determine the title based on the selected date
  const getTitleText = () => {
    const today = getTodayDateString();
    if (selectedDate === today) {
      return "Today's Habits";
    }
    // Format the date nicely for the title, e.g., "May 5, 2025"
    const date = new Date(selectedDate + "T00:00:00"); // Ensure correct timezone handling if needed
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isTodaySelected = selectedDate === getTodayDateString();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedTitle text={getTitleText()} />

      {/* Date Navigation Strip */}
      <View style={styles.dateNavContainer}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <Icon name="chevron-back-outline" size={24} color="#5E72E4" />
        </TouchableOpacity>
        <View style={styles.dateDisplayContainer}>
          <Text style={styles.dateText}>
            {formatDateReadable(selectedDate)}
          </Text>
          {!isTodaySelected && (
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Go to Today</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <Icon name="chevron-forward-outline" size={24} color="#5E72E4" />
        </TouchableOpacity>
      </View>

      <HabitList
        habits={habitsForSelectedDate}
        loading={loading}
        onToggleComplete={handleToggleComplete}
        onHabitPress={handleHabitPress}
        onRefresh={refreshHabits}
        selectedDate={selectedDate} // Pass selectedDate to HabitList
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  dateNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff", // Optional: background color for the nav strip
  },
  navButton: {
    padding: 8,
  },
  dateDisplayContainer: {
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  todayButton: {
    marginTop: 2, // Small space between date and button
  },
  todayButtonText: {
    fontSize: 12,
    color: "#5E72E4",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
    padding: 16,
  },
});
