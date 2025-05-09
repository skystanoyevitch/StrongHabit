// Mock for expo-notifications module
const Notifications = {
  getPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted", canAskAgain: true }),
  requestPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted", canAskAgain: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "mock-token" }),
  AndroidImportance: {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
  },
  setNotificationChannelAsync: jest.fn().mockResolvedValue(true),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  dismissAllNotificationsAsync: jest.fn(),
  getBadgeCountAsync: jest.fn().mockResolvedValue(0),
  setBadgeCountAsync: jest.fn().mockResolvedValue(true),
};

export default Notifications;
