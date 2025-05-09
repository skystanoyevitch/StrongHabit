import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setupNotifications,
  scheduleHabitReminder,
  cancelHabitReminder,
  toggleNotifications,
  getNotificationStatus,
} from "../notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";

// Mock expo packages
jest.mock("expo-notifications");
jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-device", () => ({
  isDevice: true,
}));

// Cast mocked methods to jest.Mock for TypeScript
const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

describe("Notifications System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItem.mockClear();
    mockedSetItem.mockClear();

    // Default mock implementations
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
    });

    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
    });

    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      "notification-id"
    );
    (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mockResolvedValue(undefined);
  });

  test("setupNotifications should request permissions if not granted", async () => {
    // Mock permissions not granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "undetermined",
      canAskAgain: true,
    });

    await setupNotifications();

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  test("setupNotifications should not request permissions if already granted", async () => {
    await setupNotifications();

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  test("toggleNotifications should store setting in AsyncStorage", async () => {
    await toggleNotifications(true);

    expect(mockedSetItem).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(true)
    );

    expect(setupNotifications).toHaveBeenCalled();
  });

  test("getNotificationStatus should retrieve status from AsyncStorage", async () => {
    mockedGetItem.mockResolvedValueOnce(JSON.stringify(true));

    const result = await getNotificationStatus();

    expect(mockedGetItem).toHaveBeenCalledWith(expect.any(String));
    expect(result).toBe(true);
  });

  test("scheduleHabitReminder should create daily notifications", async () => {
    const schedule = {
      habitId: "1",
      title: "Test Habit",
      body: "Time to complete your habit!",
      hour: 9,
      minute: 0,
      frequency: "daily",
    } as const;

    await scheduleHabitReminder(schedule);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: schedule.title,
          body: schedule.body,
        }),
        trigger: expect.objectContaining({
          hour: schedule.hour,
          minute: schedule.minute,
          repeats: true,
        }),
      })
    );
  });

  test("cancelHabitReminder should remove all notifications for a habit", async () => {
    mockedGetItem.mockResolvedValueOnce(
      JSON.stringify({
        "1": ["notification-id-1", "notification-id-2"],
      })
    );

    await cancelHabitReminder("1");

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "notification-id-1"
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "notification-id-2"
    );
  });
});
