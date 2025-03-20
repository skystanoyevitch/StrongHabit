import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { Platform } from "react-native";

const NOTIFICATIONS_KEY = "@settings_notifications";

export interface NotificationSchedule {
  habitId: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

export const setupNotifications = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

export const toggleNotifications = async (enabled: boolean) => {
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(enabled));

  if (enabled) {
    return setupNotifications();
  }
  return true;
};

export const getNotificationStatus = async (): Promise<boolean> => {
  const status = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
  return status ? JSON.parse(status) : false;
};

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token;
}

export async function scheduleHabitReminder(schedule: NotificationSchedule) {
  try {
    // Check if notifications are enabled
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    // Cancel any existing notification for this habit
    await cancelHabitReminder(schedule.habitId);

    // Create a date object for today at the specified time
    const scheduledTime = new Date();
    scheduledTime.setHours(schedule.hour || 9);
    scheduledTime.setMinutes(schedule.minute || 0);
    scheduledTime.setSeconds(0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule new notification
    const identifier = `habit-reminder-${schedule.habitId}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: schedule.title || "Habit Reminder",
        body: schedule.body || "Don't forget your habit!",
        data: { habitId: schedule.habitId },
      },
      trigger: {
        date: scheduledTime,
        repeats: true,
        channelId: "default",
      },
    });

    return identifier;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

export async function cancelHabitReminder(habitId: string) {
  try {
    const identifier = `habit-reminder-${habitId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return true;
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    return false;
  }
}
