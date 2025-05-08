import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
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
import { theme } from "../constants/theme";
import { HabitAchievements } from "../features/achievements/HabitAchievements";

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
        selectedColor: log.completed ? theme.colors.primary : "white",
        dotColor: log.completed ? theme.colors.primary : theme.colors.error,
        marked: !log.completed,
        ...(!log.completed && {
          customStyles: {
            container: {
              borderWidth: 1,
              borderColor: theme.colors.error,
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.contentWrapper}>
          <AnimatedTitle text={habit.name} />
          {habit.description && (
            <Text style={styles.habitDescription}>{habit.description}</Text>
          )}

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

          {/* Add the HabitAchievements component here */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <HabitAchievements habit={habit} />
          </View>

          <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Completion History</Text>
            <CalendarList
              pastScrollRange={2}
              futureScrollRange={0}
              scrollEnabled={false}
              markedDates={markedDates}
              removeClippedSubviews={true}
              maxToRenderPerBatch={1}
              initialNumToRender={1}
              windowSize={1}
              calendarHeight={320}
              calendarWidth={320}
              theme={{
                calendarBackground: theme.colors.surface,
                textSectionTitleColor: theme.colors.text,
                textSectionTitleDisabledColor: theme.colors.placeholder,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.contrastPrimary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.disabled,
                dotColor: theme.colors.primary,
                selectedDotColor: theme.colors.contrastPrimary,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                indicatorColor: theme.colors.primary,
                textDayFontFamily: theme.fonts.regular,
                textMonthFontFamily: theme.fonts.titleSemibold,
                textDayHeaderFontFamily: theme.fonts.semibold,
              }}
            />
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate("EditHabit", { habit })}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color={theme.colors.contrastPrimary}
            />
            <Text style={styles.buttonText}>Edit Habit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color={theme.colors.contrastPrimary}
            />
            <Text style={styles.buttonText}>Delete Habit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  contentWrapper: {
    paddingHorizontal: 0,
  },
  habitDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginHorizontal: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  statLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginTop: 4,
  },
  achievementsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    marginBottom: 16,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    marginTop: 8,
    borderTopWidth: 0.5,
    borderColor: theme.colors.outline,
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
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.contrastPrimary,
    fontSize: 16,
    marginLeft: 8,
  },
});
