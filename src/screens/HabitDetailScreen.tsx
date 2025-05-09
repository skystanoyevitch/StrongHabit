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
import { Calendar, CalendarProps } from "react-native-calendars";
import { StorageService } from "../utils/storage";
import { Habit } from "../types/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { theme } from "../constants/theme";
import { HabitAchievements } from "../features/achievements/HabitAchievements";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackButton } from "../components/BackButton";

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
      <BackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with habit icon */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={36}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.headerTitle}>{habit.name}</Text>
          {habit.description && (
            <Text style={styles.headerSubtitle}>{habit.description}</Text>
          )}
        </Animated.View>

        <View style={styles.contentWrapper}>
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.statsContainer}
          >
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
          </Animated.View>

          {/* Add the HabitAchievements component here */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.achievementsContainer}
          >
            <Text style={styles.sectionTitle}>Achievements</Text>
            <HabitAchievements habit={habit} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.calendarContainer}
          >
            <Text style={styles.sectionTitle}>Completion History</Text>
            <View style={styles.calendarInstructions}>
              <MaterialCommunityIcons
                name="gesture-swipe-horizontal"
                size={16}
                color={theme.colors.secondaryText}
              />
              <Text style={styles.calendarInstructionsText}>
                Swipe left/right to view different months
              </Text>
            </View>
            <Calendar
              // Show current month with ability to navigate to previous/next months
              current={new Date().toISOString().split("T")[0]}
              markedDates={markedDates}
              hideExtraDays={false}
              enableSwipeMonths={true}
              showSixWeeks={false}
              disableMonthChange={false}
              onMonthChange={(month) => {
                console.log("Month changed to:", month.dateString);
              }}
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
          </Animated.View>
        </View>
        <Animated.View
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={styles.actions}
        >
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
        </Animated.View>
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: theme.fonts.titleBold,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginBottom: 16,
    textAlign: "center",
    maxWidth: "90%",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 26,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarInstructions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  calendarInstructionsText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginLeft: 5,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    marginBottom: 16,
    color: theme.colors.text,
    paddingLeft: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    minWidth: 145,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  // Add a back button
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
});
