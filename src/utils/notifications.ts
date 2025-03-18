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
  // Temporarily disabled for MVP
  console.log("Notifications temporarily disabled");
  return `habit-reminder-${schedule.habitId}`;

  // TODO: Fix notification scheduling
  /*
  const identifier = `habit-reminder-${schedule.habitId}`;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: schedule.title,
      body: schedule.body,
      data: { habitId: schedule.habitId },
    },
    trigger: {
      type: "daily",
      hour: schedule.hour,
      minute: schedule.minute,
      repeats: true,
    },
    identifier,
  });
  return identifier;
  */
}

export async function cancelHabitReminder(habitId: string) {
  // Temporarily disabled for MVP
  console.log("Cancel notification temporarily disabled");
  return;

  /*
  const identifier = `habit-reminder-${habitId}`;
  await Notifications.cancelScheduledNotificationAsync(identifier);
  */
}
