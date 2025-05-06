import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { CalendarList } from "react-native-calendars";
import { StorageService } from "../utils/storage";
import { Habit } from "../types/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { theme } from "../constants/theme"; // Import theme

type HabitDetailScreenRouteProp = RouteProp<RootStackParamList, "HabitDetail">;

interface CompletionStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  successRate: number;
}

export default function HabitDetailScreen() {
  const route = useRoute<HabitDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { habit } = route.params;
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});
  const storageService = StorageService.getInstance();

  const calculateStats = useCallback(() => {
    const completionLogs = habit.completionLogs || [];
    const totalDays = completionLogs.length;
    const completedDays = completionLogs.filter((log) => log.completed).length;

    setStats({
      totalDays,
      completedDays,
      currentStreak: habit.streak || 0,
      successRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
    });

    // Format dates for the calendar
    const marked: { [key: string]: any } = {};
    completionLogs.forEach((log) => {
      const dateString = log.date.split("T")[0]; // Extract YYYY-MM-DD part
      marked[dateString] = {
        selected: true,
        selectedColor: log.completed ? "#0F4D92" : "white",
        dotColor: log.completed ? "#0F4D92" : "#FF5252",
        marked: !log.completed,
        ...(!log.completed && {
          customStyles: {
            container: {
              borderWidth: 1,
              borderColor: "#FF5252",
            },
          },
        }),
      };
    });

    setMarkedDates(marked);
  }, [habit]);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.deleteHabit(habit.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete habit");
            }
          },
        },
      ]
    );
  }, [habit.id, navigation]);

  React.useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <AnimatedTitle text="Habit Overview" />
      <View style={styles.header}>
        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.description}>{habit.description}</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(stats.successRate)}%
              </Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedDays}</Text>
              <Text style={styles.statLabel}>Total Completions</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Completion History</Text>
        <CalendarList
          pastScrollRange={2}
          futureScrollRange={0}
          scrollEnabled={true}
          showScrollIndicator={true}
          markedDates={markedDates}
          removeClippedSubviews={true}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          windowSize={1}
          calendarHeight={320}
          calendarWidth={320}
          style={{ height: "100%" }}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate("EditHabit", { habit })}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
          <Text style={styles.buttonText}>Edit Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
          <Text style={styles.buttonText}>Delete Habit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme background
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface, // Use theme surface color
    borderRadius: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: theme.fonts.titleBold, // Use Quicksand Bold
    fontSize: 24,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    marginBottom: 8,
    color: theme.colors.text, // Use theme text color
  },
  description: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.secondaryText, // Use theme secondary text color
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: theme.colors.surface, // Use theme surface color
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold for stat values
    fontSize: 24,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    color: theme.colors.primary, // Use theme primary color for emphasis
  },
  statLabel: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    color: theme.colors.secondaryText, // Use theme secondary text color
    marginTop: 4,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface, // Use theme surface color
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 18,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    marginBottom: 16,
    color: theme.colors.text, // Use theme text color
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: theme.colors.surface, // Use theme surface color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: theme.colors.primary, // Use theme primary color
  },
  deleteButton: {
    backgroundColor: theme.colors.error, // Use theme error color
  },
  buttonText: {
    fontFamily: theme.fonts.semibold, // Use Inter Semibold
    color: theme.colors.contrastPrimary, // Use contrast color for text on primary/error background
    fontSize: 16,
    marginLeft: 8,
    // fontWeight: "600", // fontWeight is part of fontFamily now
  },
});
