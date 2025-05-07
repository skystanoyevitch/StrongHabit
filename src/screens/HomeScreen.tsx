import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
  Platform, // Import Platform
  FlatList, // Added FlatList
  Dimensions, // Added Dimensions
  NativeSyntheticEvent, // Added for scroll event
  NativeScrollEvent, // Added for scroll event
  ActivityIndicator, // Added ActivityIndicator
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
// Icon import is needed for Today button
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme"; // Import theme

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => new Date().toISOString().split("T")[0];

// Helper function to format date string (YYYY-MM-DD) to a readable format for the title
const formatDateReadableForTitle = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00"); // Avoid timezone issues
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today for comparison

  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString(undefined, {
    month: "short", // "May"
    day: "numeric", // "7"
    // weekday: 'short', // Optional: "Wed"
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

const screenWidth = Dimensions.get("window").width;
const DATE_ITEM_WIDTH = screenWidth / 3; // Show 3 items, center one is prominent
const NUM_BUFFER_DAYS = 90; // Number of days to load on each side of the initial date

// Define the structure for pre-calculated date items
interface CalendarDateItem {
  id: string; // The original date string, e.g., "2025-05-07"
  dayOfMonth: string;
  dayOfWeekShort: string;
}

// Define props for MemoizedDateItem
interface DateItemProps {
  item: CalendarDateItem; // Pass the whole pre-calculated item
  isSelected: boolean;
  onPressItem: (dateId: string, index: number) => void;
  itemWidth: number;
  index: number;
}

// Create the DateItem component
const DateItem: React.FC<DateItemProps> = ({
  item,
  isSelected,
  onPressItem,
  itemWidth,
  index,
}) => {
  // dayOfMonth and dayOfWeekShort are now directly from item
  return (
    <TouchableOpacity
      onPress={() => onPressItem(item.id, index)} // Use item.id
      style={[
        styles.dateItemContainer,
        { width: itemWidth },
        isSelected
          ? styles.selectedDateItemContainer
          : styles.nonSelectedDateItemContainer,
      ]}
    >
      <Text
        style={[
          isSelected
            ? styles.selectedDateItemTextDayOfWeek
            : styles.nonSelectedDateItemTextDayOfWeek,
        ]}
      >
        {item.dayOfWeekShort}
      </Text>
      <Text
        style={[
          isSelected
            ? styles.selectedDateItemTextDayOfMonth
            : styles.nonSelectedDateItemTextDayOfMonth,
        ]}
      >
        {item.dayOfMonth}
      </Text>
    </TouchableOpacity>
  );
};

// Memoize the DateItem component
const MemoizedDateItem = React.memo(DateItem);

export default function HomeScreen() {
  const { habits, loading, error, refreshHabits } = useHabits();
  const storageService = StorageService.getInstance();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  );
  // Update state to hold CalendarDateItem objects
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const flatListRef = useRef<FlatList<CalendarDateItem>>(null); // Update FlatList type
  const initialScrollPerformedRef = useRef(false);

  // Generate initial list of dates with pre-calculated display values
  useEffect(() => {
    const todayStr = getTodayDateString();
    const dates: CalendarDateItem[] = [];
    for (let i = -NUM_BUFFER_DAYS; i <= NUM_BUFFER_DAYS; i++) {
      const currentDateString = addDays(todayStr, i);
      const dateObj = new Date(currentDateString + "T00:00:00");
      dates.push({
        id: currentDateString,
        dayOfMonth: dateObj.getDate().toString(),
        dayOfWeekShort: dateObj
          .toLocaleDateString(undefined, { weekday: "short" })
          .substring(0, 3)
          .toUpperCase(),
      });
    }
    setCalendarDates(dates);
  }, []);

  // Scroll to selected date when calendarDates are populated or selectedDate changes
  useEffect(() => {
    if (
      flatListRef.current &&
      calendarDates.length > 0 &&
      !initialScrollPerformedRef.current
    ) {
      const index = calendarDates.findIndex((d) => d.id === selectedDate); // Compare with item.id
      if (index !== -1) {
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5, // Center the item
        });
        initialScrollPerformedRef.current = true;
      }
    }
  }, [calendarDates, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      refreshHabits();
      const index = calendarDates.findIndex((d) => d.id === selectedDate); // Compare with item.id
      if (index !== -1 && flatListRef.current) {
        setTimeout(
          () =>
            flatListRef.current?.scrollToIndex({
              index,
              animated: false,
              viewPosition: 0.5,
            }),
          50
        );
      }
      return () => {};
    }, [refreshHabits, selectedDate, calendarDates])
  );

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
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
  }, []); // Removed dependencies as per original

  const handleToggleComplete = useCallback(
    async (habitId: string, completed: boolean) => {
      try {
        await storageService.updateHabitCompletion(
          habitId,
          selectedDate,
          completed
        );
        refreshHabits();
      } catch (err) {
        console.error("Failed to toggle habit completion:", err);
        Alert.alert(
          "Update Error",
          "Failed to update habit status. Please try again."
        );
      }
    },
    [storageService, refreshHabits, selectedDate]
  );

  const handleHabitPress = useCallback(
    (habit: Habit) => {
      navigation.navigate("HabitDetail", { habit });
    },
    [navigation]
  );

  const handleDateItemPress = useCallback(
    (dateId: string, index: number) => {
      // Parameter is now dateId
      setSelectedDate(dateId);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    },
    [setSelectedDate]
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const centerBasedIndex = Math.round(
      (offsetX + screenWidth / 2 - DATE_ITEM_WIDTH / 2) / DATE_ITEM_WIDTH
    );
    const currentItem = calendarDates[centerBasedIndex]; // This is a CalendarDateItem
    if (currentItem && currentItem.id !== selectedDate) {
      // Compare with item.id
      setSelectedDate(currentItem.id);
    }
  };

  const getItemLayout = useCallback(
    (data: ArrayLike<CalendarDateItem> | null | undefined, index: number) => ({
      // Update data type
      length: DATE_ITEM_WIDTH,
      offset: DATE_ITEM_WIDTH * index,
      index,
    }),
    []
  );

  const renderDateItem = useCallback(
    ({ item, index }: { item: CalendarDateItem; index: number }) => {
      // item is CalendarDateItem
      return (
        <MemoizedDateItem
          item={item} // Pass the whole item
          isSelected={item.id === selectedDate} // Compare with item.id
          onPressItem={handleDateItemPress}
          itemWidth={DATE_ITEM_WIDTH}
          index={index}
        />
      );
    },
    [selectedDate, handleDateItemPress]
  );

  const habitsForSelectedDate = habits
    .filter((habit) => {
      if (habit.archivedAt) return false;
      if (habit.frequency === "daily") return true;
      if (habit.frequency === "weekly") {
        const selectedDayOfWeek = getDayOfWeek(selectedDate);
        return habit.selectedDays?.includes(selectedDayOfWeek) ?? false;
      }
      return false;
    })
    .map((habit) => {
      const logEntry = habit.completionLogs?.find(
        (log) => log.date.split("T")[0] === selectedDate
      );
      const completed = logEntry ? logEntry.completed : false;
      return { ...habit, completed };
    });

  const getTitleText = () => {
    const today = getTodayDateString();
    if (selectedDate === today) {
      return "Today's Habits";
    }
    const date = new Date(selectedDate + "T00:00:00");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Padding to center the first and last items in the FlatList
  const flatListPadding = (screenWidth - DATE_ITEM_WIDTH) / 2;

  // Calculate initial scroll index safely for the FlatList
  let initialDateViewIndex: number | undefined = undefined;
  if (calendarDates.length > 0) {
    const todayIndex = calendarDates.findIndex(
      (d) => d.id === getTodayDateString()
    );
    if (todayIndex !== -1) {
      initialDateViewIndex = todayIndex;
    }
    // If todayIndex is -1 (e.g., date not in list), initialDateViewIndex remains undefined.
    // FlatList will default to the start if initialScrollIndex is undefined.
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedTitle text={getTitleText()} />

      {/* Today Button */}
      <TouchableOpacity
        style={styles.todayButton}
        onPress={() => {
          const todayIndex = calendarDates.findIndex(
            (d) => d.id === getTodayDateString()
          );
          if (todayIndex !== -1) {
            setSelectedDate(getTodayDateString());
            flatListRef.current?.scrollToIndex({
              index: todayIndex,
              animated: true,
              viewPosition: 0.5,
            });
          }
        }}
      >
        <MaterialCommunityIcons
          name="calendar-today"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>

      {/* Swipeable Date Picker */}
      <View style={styles.datePickerContainer}>
        {calendarDates.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={calendarDates}
            renderItem={renderDateItem}
            keyExtractor={(item: CalendarDateItem) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={DATE_ITEM_WIDTH}
            decelerationRate="fast"
            getItemLayout={getItemLayout}
            initialScrollIndex={initialDateViewIndex} // Use safely calculated index
            onMomentumScrollEnd={handleScrollEnd}
            contentContainerStyle={{ paddingHorizontal: flatListPadding }}
            style={styles.flatListStyle}
            initialNumToRender={7}
            windowSize={11}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
          />
        ) : (
          // Show a loading indicator while dates are being prepared
          <View style={styles.loadingContainerForDatePicker}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      </View>

      <HabitList
        habits={habitsForSelectedDate}
        loading={loading}
        onToggleComplete={handleToggleComplete}
        onHabitPress={handleHabitPress}
        onRefresh={refreshHabits}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  datePickerContainer: {
    height: 80, // Adjusted height to accommodate potentially larger selected item
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant, // Use theme color
    backgroundColor: theme.colors.surface, // Use theme color
    marginBottom: 8, // Add some space below the date picker
    justifyContent: "center", // Added for loading indicator centering
  },
  loadingContainerForDatePicker: {
    // Added style for loading indicator
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListStyle: {
    flexGrow: 0, // Prevent FlatList from taking too much space if not needed
  },
  dateItemContainer: {
    // New base style for each date item container
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  selectedDateItemContainer: {
    // Style for the selected (central) date item
    // backgroundColor: theme.colors.primaryContainer, // Optional: subtle background highlight
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  nonSelectedDateItemContainer: {
    // Style for non-selected (side) date items
    opacity: 0.6, // Make them less prominent
  },
  // Removed old dateItem and selectedDateItem styles as they are replaced

  // Text styles for Day of Week
  selectedDateItemTextDayOfWeek: {
    fontSize: 14, // Larger font for selected
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  nonSelectedDateItemTextDayOfWeek: {
    fontSize: 12, // Smaller font for non-selected
    fontFamily: theme.fonts.regular,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },

  // Text styles for Day of Month
  selectedDateItemTextDayOfMonth: {
    fontSize: 22, // Larger font for selected
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  nonSelectedDateItemTextDayOfMonth: {
    fontSize: 16, // Smaller font for non-selected
    fontFamily: theme.fonts.semibold,
    color: theme.colors.onSurface,
  },
  // Removed old dateItemDayOfWeek, dateItemDayOfMonth, selectedDateItemText styles

  title: {
    // Example style if AnimatedTitle doesn't have its own full styling
    fontFamily: theme.fonts.titleBold,
    fontSize: 24,
    marginBottom: 10, // Adjusted margin
    color: theme.colors.text,
    paddingHorizontal: 16, // Keep horizontal padding
    paddingTop: 10, // Add some top padding
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  todayButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
});
