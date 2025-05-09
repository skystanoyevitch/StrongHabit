import AsyncStorage from "@react-native-async-storage/async-storage";

// Key for storing user's timezone setting
const TIMEZONE_PREFERENCE_KEY = "@timezone_preference";

// Default timezone offset in minutes
const DEFAULT_TIMEZONE_OFFSET = new Date().getTimezoneOffset();

/**
 * Gets the user's preferred timezone offset in minutes
 * If not set, returns the device's default timezone offset
 */
export const getTimezoneOffset = async (): Promise<number> => {
  try {
    const storedOffsetStr = await AsyncStorage.getItem(TIMEZONE_PREFERENCE_KEY);
    if (storedOffsetStr !== null) {
      return parseInt(storedOffsetStr, 10);
    }
    return DEFAULT_TIMEZONE_OFFSET;
  } catch (error) {
    console.error("Error getting timezone preference:", error);
    return DEFAULT_TIMEZONE_OFFSET;
  }
};

/**
 * Sets the user's preferred timezone offset in minutes
 */
export const setTimezoneOffset = async (
  offsetMinutes: number
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      TIMEZONE_PREFERENCE_KEY,
      offsetMinutes.toString()
    );
  } catch (error) {
    console.error("Error setting timezone preference:", error);
  }
};

/**
 * Returns the current date adjusted for the user's timezone
 * This is useful for consistent date comparisons across timezones
 */
export const getCurrentDateInUserTimezone = async (): Promise<Date> => {
  const offset = await getTimezoneOffset();
  const date = new Date();

  // Apply the user timezone offset
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc - offset * 60000);
};

/**
 * Formats a date for display with appropriate timezone adjustment
 */
export const formatDateForDisplay = async (date: Date): Promise<string> => {
  const offset = await getTimezoneOffset();

  // Apply user timezone
  const userDate = new Date(date.getTime() - offset * 60000);

  return userDate.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Returns the current date as an ISO string but with timezone adjustment
 * This is crucial for streak calculations
 */
export const getTodayDateString = async (): Promise<string> => {
  const userDate = await getCurrentDateInUserTimezone();
  return userDate.toISOString().split("T")[0];
};

/**
 * Returns yesterday's date string with timezone adjustment
 */
export const getYesterdayDateString = async (): Promise<string> => {
  const userDate = await getCurrentDateInUserTimezone();
  userDate.setDate(userDate.getDate() - 1);
  return userDate.toISOString().split("T")[0];
};

/**
 * Check if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get start of day for a given date
 */
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day for a given date
 */
export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};
