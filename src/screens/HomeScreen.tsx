import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Animated,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { useHabits } from "../hooks/useHabits";
import { HabitList } from "../components/HabitList";
import { DayOfWeek, Habit } from "../types/habit";
import { StorageService } from "../utils/storage";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

// Helper function to get today's date in YYYY-MM-DD format - improved to handle timezone issues
const getTodayDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

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
// Adjust for horizontal wheel effect
const ITEM_WIDTH = screenWidth / 4; // Width of each date item
const NUM_BUFFER_DAYS = 90;
const PERSPECTIVE = 800;
const VISIBLE_ITEMS = 3; // Number of items visible in the wheel

// Define the structure for pre-calculated date items
interface CalendarDateItem {
  id: string;
  dayOfMonth: string;
  dayOfWeekShort: string;
  monthShort: string; // Added to show month
}

// Define props for WheeledDateItem component
interface DateItemProps {
  item: CalendarDateItem;
  index: number;
  scrollX: Animated.Value; // Changed from scrollY to scrollX
  itemWidth: number; // Changed from itemHeight to itemWidth
  onPress: (date: string) => void;
  isSelected: boolean;
}

// WheeledDateItem component with 3D transformations for horizontal scrolling
const WheeledDateItem: React.FC<DateItemProps> = ({
  item,
  index,
  scrollX,
  itemWidth,
  onPress,
  isSelected,
}) => {
  // Memoize the inputRange and outputRange values to prevent recalculations on every render
  const inputRange = useMemo(
    () => [
      (index - 2) * itemWidth,
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
      (index + 2) * itemWidth,
    ],
    [index, itemWidth]
  );

  // Animated values - memoize to prevent recreation on every render
  const animatedStyles = useMemo(() => {
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 0.8, 1.0, 0.8, 0.6],
      extrapolate: "clamp", // Prevent extrapolation beyond the input range
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["45deg", "25deg", "0deg", "-25deg", "-45deg"],
      extrapolate: "clamp", // Prevent extrapolation beyond the input range
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
      extrapolate: "clamp", // Prevent extrapolation beyond the input range
    });

    return {
      transform: [{ perspective: PERSPECTIVE }, { rotateY }, { scale }],
      opacity,
    };
  }, [inputRange, scrollX]);

  // Memoize the onPress handler for the specific item
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [onPress, item.id]);

  return (
    <Animated.View
      style={[
        styles.wheelItem,
        {
          width: itemWidth,
        },
        animatedStyles,
      ]}
      // Add removeClippedSubviews for items that are offscreen
      removeClippedSubviews={Platform.OS === "android"}
    >
      <TouchableOpacity
        style={[
          styles.wheelItemTouchable,
          isSelected && styles.wheelItemSelectedCircle,
        ]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.wheelItemDayOfWeek,
            isSelected && styles.wheelItemTextSelected,
          ]}
        >
          {item.dayOfWeekShort}
        </Text>
        <Text
          style={[
            styles.wheelItemDayOfMonth,
            isSelected && styles.wheelItemTextSelected,
          ]}
        >
          {item.dayOfMonth}
        </Text>
        <Text
          style={[
            styles.wheelItemMonth,
            isSelected && styles.wheelItemTextSelected,
          ]}
        >
          {item.monthShort}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps: DateItemProps, nextProps: DateItemProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index &&
    prevProps.itemWidth === nextProps.itemWidth
    // We don't compare scrollX because it changes frequently
    // and we want the animation to update, but not the component itself
  );
};

// Create a memoized version of WheeledDateItem
const MemoizedWheeledDateItem = React.memo(WheeledDateItem, areEqual);

export default function HomeScreen() {
  const { habits, loading, error, refreshHabits } = useHabits();
  const storageService = StorageService.getInstance();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  );
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current; // Changed from scrollY to scrollX
  const initialScrollPerformedRef = useRef(false);

  // Scrolling control flags to prevent automatic scrolling
  const isManualScrollRef = useRef(false);
  const preventAutoScrollRef = useRef(false);

  // Generate initial list of dates with pre-calculated display values
  useEffect(() => {
    const todayStr = getTodayDateString();
    // Reduce number of days to improve performance
    const visibleDays = Math.min(NUM_BUFFER_DAYS, 45); // Reduce total number of days
    const dates: CalendarDateItem[] = [];
    for (let i = -visibleDays; i <= visibleDays; i++) {
      const currentDateString = addDays(todayStr, i);
      const dateObj = new Date(currentDateString + "T00:00:00");
      dates.push({
        id: currentDateString,
        dayOfMonth: dateObj.getDate().toString(),
        dayOfWeekShort: dateObj
          .toLocaleDateString(undefined, { weekday: "short" })
          .substring(0, 3)
          .toUpperCase(),
        monthShort: dateObj
          .toLocaleDateString(undefined, { month: "short" })
          .substring(0, 3)
          .toUpperCase(),
      });
    }
    setCalendarDates(dates);
  }, []);

  // Ensure today's date is centered on initial load
  useEffect(() => {
    if (flatListRef.current && calendarDates.length > 0) {
      const todayIndex = calendarDates.findIndex(
        (d) => d.id === getTodayDateString()
      );

      if (todayIndex !== -1) {
        // Ensure we delay this just slightly to allow the FlatList to fully render
        setTimeout(() => {
          if (flatListRef.current) {
            preventAutoScrollRef.current = true;
            flatListRef.current.scrollToIndex({
              index: todayIndex,
              animated: false,
              viewPosition: 0.5, // Explicitly ensure center alignment
            });

            // Reset the prevention flag after a delay
            setTimeout(() => {
              preventAutoScrollRef.current = false;
            }, 300);
          }
        }, 100);
      }
    }
  }, [calendarDates]); // Only run when calendar dates change

  // Scroll to selected date when calendarDates are populated or selectedDate changes
  // Modified to prevent unintended automatic scrolling
  useEffect(() => {
    if (
      flatListRef.current &&
      calendarDates.length > 0 &&
      !initialScrollPerformedRef.current
    ) {
      const index = calendarDates.findIndex((d) => d.id === selectedDate);
      if (index !== -1) {
        preventAutoScrollRef.current = true; // Prevent handling this as a user scroll
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5,
        });
        initialScrollPerformedRef.current = true;
        // Reset the flag after initial scroll
        setTimeout(() => {
          preventAutoScrollRef.current = false;
        }, 500);
      }
    }
  }, [calendarDates, selectedDate]);

  // Modified useFocusEffect to prevent unwanted auto-scrolling
  useFocusEffect(
    React.useCallback(() => {
      refreshHabits();

      // Don't automatically scroll on focus - this was causing the scroll back issue
      return () => {};
    }, [refreshHabits])
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

  // Modified to handle simplified date selection with scroll control
  const handleDateItemPress = useCallback(
    (dateId: string) => {
      setSelectedDate(dateId);
      const index = calendarDates.findIndex((d) => d.id === dateId);
      if (index !== -1 && flatListRef.current) {
        preventAutoScrollRef.current = true; // Flag to prevent handling this as a user scroll
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
        // Reset the flag after animation should be complete
        setTimeout(() => {
          preventAutoScrollRef.current = false;
        }, 500);
      }
    },
    [calendarDates, setSelectedDate]
  );

  // Updated scroll handler to respect the control flags
  const handleScroll = useCallback(
    Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Only set manual scroll flag when user is actually scrolling
        if (!preventAutoScrollRef.current) {
          isManualScrollRef.current = true;
        }
      },
    }),
    [] // Empty dependency array to ensure this function is stable
  );

  // Adjust scroll behavior for wheel effect
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Only process scroll end if it was a manual scroll
      if (isManualScrollRef.current && !preventAutoScrollRef.current) {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_WIDTH);

        if (index >= 0 && index < calendarDates.length) {
          const selectedId = calendarDates[index].id;
          if (selectedId !== selectedDate) {
            setSelectedDate(selectedId);
          }

          // Ensure the wheel aligns perfectly to an item
          if (
            flatListRef.current &&
            Math.abs(offsetX - index * ITEM_WIDTH) > 1
          ) {
            preventAutoScrollRef.current = true;
            flatListRef.current.scrollToOffset({
              offset: index * ITEM_WIDTH,
              animated: true,
            });

            // Reset flags after animation completes
            setTimeout(() => {
              preventAutoScrollRef.current = false;
              isManualScrollRef.current = false;
            }, 300);
          } else {
            isManualScrollRef.current = false;
          }
        }
      }
    },
    [calendarDates, selectedDate, ITEM_WIDTH]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH, // Changed from ITEM_HEIGHT to ITEM_WIDTH
      offset: ITEM_WIDTH * index, // Changed from ITEM_HEIGHT to ITEM_WIDTH
      index,
    }),
    [ITEM_WIDTH]
  );

  // Render a wheel item
  const renderWheelItem = useCallback(
    ({ item, index }: { item: CalendarDateItem; index: number }) => {
      return (
        <MemoizedWheeledDateItem
          item={item}
          index={index}
          scrollX={scrollX} // Changed from scrollY to scrollX
          itemWidth={ITEM_WIDTH} // Changed from itemHeight to itemWidth
          onPress={handleDateItemPress}
          isSelected={item.id === selectedDate}
        />
      );
    },
    [selectedDate, handleDateItemPress, scrollX, ITEM_WIDTH]
  );

  const habitsForSelectedDate = habits
    .filter((habit) => {
      if (habit.archivedAt) return false;
      if (habit.frequency === "daily") return true;
      if (habit.frequency === "weekly") {
        const selectedDayOfWeek = getDayOfWeek(selectedDate);
        return habit.selectedDays?.includes(selectedDayOfWeek) ?? false;
      }
      if (habit.frequency === "monthly") {
        // For monthly habits, check if the current day of month is in the selected days
        const dayOfMonth = new Date(selectedDate + "T00:00:00").getDate();
        return habit.monthlyDays?.includes(dayOfMonth) ?? false;
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

  // Calculate initial scroll index safely for the wheel
  let initialDateViewIndex: number | undefined = undefined;
  if (calendarDates.length > 0) {
    const todayIndex = calendarDates.findIndex(
      (d) => d.id === getTodayDateString()
    );
    if (todayIndex !== -1) {
      initialDateViewIndex = todayIndex;
    }
  }

  // Memoize the contentContainerStyle to prevent recreation on every render
  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2,
    }),
    [screenWidth, ITEM_WIDTH]
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedTitle text={getTitleText()} />

      {/* Today Button */}
      <TouchableOpacity
        style={styles.todayButton}
        onPress={() => {
          // Force recalculation of today's date to ensure it's accurate
          const todayStr = getTodayDateString();
          console.log("Today's date:", todayStr); // Debug logging

          // Update selected date first
          setSelectedDate(todayStr);

          // Wait for state update to complete
          setTimeout(() => {
            // Find index of today's date in the calendar dates array
            const todayIndex = calendarDates.findIndex(
              (d) => d.id === todayStr
            );
            console.log(
              "Today index:",
              todayIndex,
              "Date:",
              calendarDates[todayIndex]?.id
            ); // Debug logging

            if (todayIndex !== -1 && flatListRef.current) {
              // Set flag to prevent interference from other scroll handlers
              preventAutoScrollRef.current = true;

              // Use scrollToOffset for more precise control
              flatListRef.current.scrollToOffset({
                offset: todayIndex * ITEM_WIDTH,
                animated: true,
              });

              // Reset prevention flag after animation completes
              setTimeout(() => {
                preventAutoScrollRef.current = false;
              }, 500);
            }
          }, 50);
        }}
      >
        <MaterialCommunityIcons
          name="calendar-today"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>

      {/* Horizontal Date Wheel Picker */}
      <View style={styles.wheelContainer}>
        {calendarDates.length > 0 ? (
          <>
            {/* Left indicator arrow */}
            <View style={styles.scrollIndicator}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={theme.colors.primary}
              />
            </View>

            {/* Wheel FlatList - now horizontal with performance optimizations */}
            <Animated.FlatList
              ref={flatListRef as any}
              data={calendarDates}
              renderItem={renderWheelItem}
              keyExtractor={(item) => item.id}
              horizontal={true} // Changed to horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH} // Changed from ITEM_HEIGHT to ITEM_WIDTH
              decelerationRate="fast"
              getItemLayout={getItemLayout}
              initialScrollIndex={initialDateViewIndex}
              onMomentumScrollEnd={handleScrollEnd}
              onScroll={handleScroll}
              contentContainerStyle={contentContainerStyle}
              style={styles.wheelFlatList}
              centerContent={true} // Add this to help with centering
              removeClippedSubviews={true} // Improve memory usage
              initialNumToRender={5} // Reduce initial render load
              maxToRenderPerBatch={3} // Reduce batch rendering
              windowSize={5} // Reduce window size (1 visible screen + 2 screens before/after)
              updateCellsBatchingPeriod={50} // Batch updates
            />

            {/* Right indicator arrow */}
            <View style={[styles.scrollIndicator, styles.scrollIndicatorRight]}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </>
        ) : (
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

  // Wheel container styles - updated for horizontal scrolling
  wheelContainer: {
    height: 70, // Fixed height for horizontal wheel
    flexDirection: "row", // Changed to row for horizontal layout
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
    // Removed borderTop and borderBottom
  },

  // Scroll indicators repositioned to sides
  scrollIndicator: {
    position: "absolute",
    left: 4, // Changed from top to left
    height: "100%", // Changed from width to height
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  scrollIndicatorRight: {
    left: "auto", // Reset left
    right: 4, // Position on right side
  },

  wheelFlatList: {
    height: "100%", // Changed from width to height
  },

  wheelContentContainer: {
    // Ensure padding is exactly right to center items
    paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2,
  },

  // Individual wheel item
  wheelItem: {
    height: "100%", // Changed from width to height
    justifyContent: "center",
    alignItems: "center",
    // width is set dynamically
  },

  wheelItemSelected: {
    // Can add specific styling for selected items if needed
  },

  wheelItemTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15, // Add some horizontal padding for the circle
  },

  // Added style for selected item circle
  wheelItemSelectedCircle: {
    backgroundColor: theme.colors.primary, // Transparent background
    borderWidth: 0.5, // Border width for circle
    borderColor: theme.colors.primary, // Theme primary color for border
    borderRadius: 24, // Large radius to ensure circle shape
    padding: 4, // Inner padding to give circle some space from content
  },

  wheelItemDayOfWeek: {
    fontSize: 10, // Smaller font size for more compact display
    fontFamily: theme.fonts.regular,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 0, // Tighter spacing
  },

  wheelItemDayOfMonth: {
    fontSize: 20, // More prominent day number
    fontFamily: theme.fonts.semibold,
    color: theme.colors.onSurface,
  },

  wheelItemMonth: {
    fontSize: 10, // Smaller font size
    fontFamily: theme.fonts.regular,
    color: theme.colors.onSurfaceVariant,
    marginTop: 0, // Tighter spacing
  },

  wheelItemTextSelected: {
    color: theme.colors.contrastPrimary,
    fontFamily: theme.fonts.bold,
  },

  loadingContainerForDatePicker: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.outlineVariant,
  },

  todayButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },

  // Other existing styles...
});
