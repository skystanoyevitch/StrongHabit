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
    const completionLogs = habit.completionLogs || {};
    const totalDays = Object.keys(completionLogs).length;
    const completedDays = Object.values(completionLogs).filter(Boolean).length;

    setStats({
      totalDays,
      completedDays,
      currentStreak: habit.streak || 0,
      successRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
    });

    // Mark completed dates in calendar
    const marked = Object.entries(completionLogs).reduce(
      (acc, [date, completed]) => ({
        ...acc,
        [date]: {
          marked: true,
          dotColor: completed ? "#4CAF50" : "#FF5252",
        },
      }),
      {}
    );
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          pastScrollRange={3}
          futureScrollRange={0}
          scrollEnabled={true}
          showScrollIndicator={true}
          markedDates={markedDates}
          removeClippedSubviews={true}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          windowSize={2}
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
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
});
