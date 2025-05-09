import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeBackupSystem,
  createBackup,
  restoreFromFile,
  getBackups,
  deleteBackup,
  getAutoBackupConfig,
  setAutoBackupConfig,
  runAutoBackupIfNeeded,
  AutoBackupConfig,
} from "../backupUtils";

// Mock dependencies
jest.mock("expo-file-system");
jest.mock("expo-sharing");
jest.mock("@react-native-async-storage/async-storage");

// Cast mocked methods to jest.Mock for TypeScript
const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

describe("Backup Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([]);
    (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("{}");
    (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

    mockedGetItem.mockResolvedValue(null);
    mockedSetItem.mockResolvedValue(undefined);
  });

  describe("initializeBackupSystem", () => {
    test("should create backup directory if it does not exist", async () => {
      await initializeBackupSystem();

      expect(FileSystem.getInfoAsync).toHaveBeenCalled();
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    test("should not create directory if it already exists", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
      });

      await initializeBackupSystem();

      expect(FileSystem.getInfoAsync).toHaveBeenCalled();
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe("createBackup", () => {
    beforeEach(() => {
      mockedGetItem.mockResolvedValueOnce(
        JSON.stringify({
          habits: [{ id: "1", name: "Test Habit" }],
          lastUpdated: new Date().toISOString(),
          version: 1,
        })
      );

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });
    });

    test("should create a backup file with timestamp", async () => {
      const result = await createBackup();

      expect(mockedGetItem).toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          fileName: expect.stringContaining("stronghabit-backup"),
          habitCount: 1,
          size: 1024,
        })
      );
    });

    test("should use custom name if provided", async () => {
      const result = await createBackup("My Custom Backup");

      expect(result.fileName).toContain("My-Custom-Backup");
    });
  });

  describe("getBackups", () => {
    beforeEach(() => {
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([
        "stronghabit-backup-2023-01-01.json",
        "stronghabit-backup-2023-01-02.json",
      ]);

      (FileSystem.getInfoAsync as jest.Mock).mockImplementation((path) => {
        return Promise.resolve({
          exists: true,
          size: 1024,
          modificationTime: new Date().getTime(),
        });
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockImplementation((path) => {
        return Promise.resolve(
          JSON.stringify({
            exportDate: new Date().toISOString(),
            data: {
              habits: Array(path.includes("2023-01-01") ? 1 : 2),
            },
          })
        );
      });
    });

    test("should return list of backups with metadata", async () => {
      const backups = await getBackups();

      expect(backups.length).toBe(2);
      expect(backups[0]).toEqual(
        expect.objectContaining({
          fileName: "stronghabit-backup-2023-01-01.json",
          habitCount: 1,
          size: 1024,
        })
      );
      expect(backups[1]).toEqual(
        expect.objectContaining({
          fileName: "stronghabit-backup-2023-01-02.json",
          habitCount: 2,
          size: 1024,
        })
      );
    });
  });

  describe("Auto Backup Configuration", () => {
    const mockConfig: AutoBackupConfig = {
      enabled: true,
      frequency: "daily",
      retention: 7,
      lastBackupDate: "2023-01-01T00:00:00.000Z",
    };

    test("should save and retrieve auto backup config", async () => {
      await setAutoBackupConfig(mockConfig);

      expect(mockedSetItem).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockConfig)
      );

      mockedGetItem.mockResolvedValueOnce(JSON.stringify(mockConfig));
      const retrievedConfig = await getAutoBackupConfig();

      expect(retrievedConfig).toEqual(mockConfig);
    });

    test("runAutoBackupIfNeeded should create backup when needed", async () => {
      // Mock config with old backup date
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago

      mockedGetItem.mockResolvedValueOnce(
        JSON.stringify({
          ...mockConfig,
          lastBackupDate: oldDate.toISOString(),
        })
      );

      // Setup for createBackup
      mockedGetItem.mockResolvedValueOnce(
        JSON.stringify({
          habits: [],
          lastUpdated: new Date().toISOString(),
          version: 1,
        })
      );

      await runAutoBackupIfNeeded();

      // Should create a backup and update the config
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(mockedSetItem).toHaveBeenCalled();
    });
  });
});
