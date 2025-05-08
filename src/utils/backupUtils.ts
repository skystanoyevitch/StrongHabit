import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert } from "react-native";
import { StorageService } from "./storage";

const STORAGE_KEY = "HABITFLOW_DATA_V1";
const BACKUP_DIRECTORY = `${FileSystem.documentDirectory}backups/`;
const AUTO_BACKUP_CONFIG_KEY = "AUTO_BACKUP_CONFIG";

export interface BackupMetadata {
  id: string;
  fileName: string;
  createdAt: string;
  habitCount: number;
  size: number; // in bytes
}

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  retention: number; // number of backups to keep
  lastBackupDate?: string;
}

// Cloud Backup Types and Configuration
export interface CloudBackupConfig {
  provider: "google-drive" | "dropbox" | "icloud" | "none";
  autoSync: boolean;
  lastSyncDate?: string;
  syncFrequency: "daily" | "weekly" | "monthly";
  userId?: string;
  email?: string;
}

// Cloud backup storage key
const CLOUD_BACKUP_CONFIG_KEY = "CLOUD_BACKUP_CONFIG";

// Ensure backup directory exists
export const initializeBackupSystem = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIRECTORY, {
        intermediates: true,
      });
    }
  } catch (error) {
    console.error("Failed to initialize backup directory:", error);
    throw new Error("Failed to initialize backup system");
  }
};

// Create a backup file with current date as filename
export const createBackup = async (
  customName?: string
): Promise<BackupMetadata> => {
  try {
    await initializeBackupSystem();

    // Get all data from AsyncStorage
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      throw new Error("No data to backup");
    }

    const parsedData = JSON.parse(data);
    const habitCount = parsedData.habits.length;

    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = customName
      ? `${customName.replace(/[^\w\s-]/g, "")}-${timestamp}.json`
      : `stronghabit-backup-${timestamp}.json`;

    const filePath = `${BACKUP_DIRECTORY}${fileName}`;

    // Add some metadata to the backup
    const backupData = {
      appVersion: "1.0.0", // Replace with your app version
      exportDate: new Date().toISOString(),
      data: parsedData,
    };

    // Write the data to the file
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(backupData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });

    const backupMetadata: BackupMetadata = {
      id: timestamp,
      fileName,
      createdAt: new Date().toISOString(),
      habitCount,
      size: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
    };

    // Update last backup timestamp in auto backup config
    await updateLastBackupDate();

    return backupMetadata;
  } catch (error) {
    console.error("Failed to create backup:", error);
    throw new Error("Failed to create backup");
  }
};

// Share a backup file
export const shareBackup = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${BACKUP_DIRECTORY}${fileName}`;
    const fileExists = await FileSystem.getInfoAsync(filePath);

    if (!fileExists.exists) {
      throw new Error("Backup file not found");
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        "Sharing not available",
        "Sharing is not available on your device"
      );
      return;
    }

    // Share the file
    await Sharing.shareAsync(filePath, {
      mimeType: "application/json",
      dialogTitle: "Share Your Habit Data Backup",
      UTI: "public.json", // for iOS
    });
  } catch (error) {
    console.error("Failed to share backup:", error);
    throw new Error("Failed to share backup");
  }
};

// Get all available backups
export const getBackups = async (): Promise<BackupMetadata[]> => {
  try {
    await initializeBackupSystem();

    const files = await FileSystem.readDirectoryAsync(BACKUP_DIRECTORY);
    const backups: BackupMetadata[] = [];

    // Process each file and extract metadata
    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = `${BACKUP_DIRECTORY}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });

      try {
        const content = await FileSystem.readAsStringAsync(filePath);
        const parsed = JSON.parse(content);

        const createdAt = parsed.exportDate || new Date().toISOString();
        const size = fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0;

        backups.push({
          id: file.replace(/\.[^/.]+$/, ""), // Remove extension
          fileName: file,
          createdAt,
          habitCount: parsed.data?.habits?.length || 0,
          size,
        });
      } catch (e) {
        // Skip files that are not valid backups
        console.warn(`Skipping invalid backup file: ${file}`);
      }
    }

    // Sort backups by date (newest first)
    return backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to get backups:", error);
    throw new Error("Failed to retrieve backups");
  }
};

// Delete a backup file
export const deleteBackup = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${BACKUP_DIRECTORY}${fileName}`;
    await FileSystem.deleteAsync(filePath);
  } catch (error) {
    console.error("Failed to delete backup:", error);
    throw new Error("Failed to delete backup");
  }
};

// Import and restore from a selected file
export const importBackup = async (): Promise<boolean> => {
  try {
    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    // User cancelled
    if (
      result.assets === null ||
      result.assets.length === 0 ||
      result.canceled
    ) {
      return false;
    }

    const asset = result.assets[0];

    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(asset.uri);
    const backupData = JSON.parse(fileContent);

    // Validate that this is a proper backup
    if (!backupData.data || !backupData.exportDate) {
      throw new Error("Invalid backup file format");
    }

    // Use the StorageService to restore the data
    const storageService = StorageService.getInstance();
    const success = await storageService.restoreData(
      JSON.stringify(backupData.data)
    );

    return success;
  } catch (error) {
    console.error("Failed to import backup:", error);
    throw new Error("Failed to import backup");
  }
};

// Configure automatic backup
export const setAutoBackupConfig = async (
  config: AutoBackupConfig
): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTO_BACKUP_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save auto backup config:", error);
    throw new Error("Failed to save auto backup settings");
  }
};

// Get automatic backup configuration
export const getAutoBackupConfig =
  async (): Promise<AutoBackupConfig | null> => {
    try {
      const config = await AsyncStorage.getItem(AUTO_BACKUP_CONFIG_KEY);
      if (!config) return null;
      return JSON.parse(config) as AutoBackupConfig;
    } catch (error) {
      console.error("Failed to get auto backup config:", error);
      throw new Error("Failed to retrieve auto backup settings");
    }
  };

// Update the last backup date in the config
const updateLastBackupDate = async (): Promise<void> => {
  try {
    const config = await getAutoBackupConfig();
    if (config) {
      config.lastBackupDate = new Date().toISOString();
      await setAutoBackupConfig(config);
    }
  } catch (error) {
    console.error("Failed to update last backup date:", error);
  }
};

// Check if it's time for an automatic backup
export const shouldRunAutoBackup = async (): Promise<boolean> => {
  try {
    const config = await getAutoBackupConfig();

    if (!config || !config.enabled || !config.lastBackupDate) {
      return config?.enabled ?? false;
    }

    const lastBackup = new Date(config.lastBackupDate);
    const now = new Date();

    switch (config.frequency) {
      case "daily":
        // Check if last backup was yesterday or earlier
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return lastBackup < yesterday;

      case "weekly":
        // Check if last backup was 7 days ago or earlier
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return lastBackup < lastWeek;

      case "monthly":
        // Check if last backup was in a previous month
        return (
          lastBackup.getMonth() !== now.getMonth() ||
          lastBackup.getFullYear() !== now.getFullYear()
        );

      default:
        return false;
    }
  } catch (error) {
    console.error("Failed to check auto backup schedule:", error);
    return false;
  }
};

// Run auto backup if needed and manage retention
export const runAutoBackupIfNeeded = async (): Promise<boolean> => {
  try {
    const shouldBackup = await shouldRunAutoBackup();

    if (!shouldBackup) {
      return false;
    }

    // Create a new backup
    await createBackup("auto");

    // Manage retention - delete old backups beyond the retention limit
    const config = await getAutoBackupConfig();
    if (!config) return true;

    const backups = await getBackups();
    const autoBackups = backups.filter((b) => b.fileName.includes("auto"));

    if (autoBackups.length > config.retention) {
      // Sort oldest first
      const oldBackups = [...autoBackups].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Delete excess backups
      const toDelete = oldBackups.slice(
        0,
        autoBackups.length - config.retention
      );
      for (const backup of toDelete) {
        await deleteBackup(backup.fileName);
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to run auto backup:", error);
    return false;
  }
};

// Restore from a file in our backups directory
export const restoreFromFile = async (fileName: string): Promise<boolean> => {
  try {
    const filePath = `${BACKUP_DIRECTORY}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) {
      throw new Error("Backup file not found");
    }

    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const backupData = JSON.parse(fileContent);

    // Validate backup format
    if (!backupData.data || !backupData.exportDate) {
      throw new Error("Invalid backup file format");
    }

    // Use the StorageService to restore the data
    const storageService = StorageService.getInstance();
    const success = await storageService.restoreData(
      JSON.stringify(backupData.data)
    );

    return success;
  } catch (error) {
    console.error("Failed to restore from file:", error);
    throw new Error("Failed to restore from backup file");
  }
};

// Configure cloud backup settings
export const setCloudBackupConfig = async (
  config: CloudBackupConfig
): Promise<void> => {
  try {
    await AsyncStorage.setItem(CLOUD_BACKUP_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save cloud backup config:", error);
    throw new Error("Failed to save cloud backup settings");
  }
};

// Get cloud backup configuration
export const getCloudBackupConfig =
  async (): Promise<CloudBackupConfig | null> => {
    try {
      const config = await AsyncStorage.getItem(CLOUD_BACKUP_CONFIG_KEY);
      if (!config) return null;
      return JSON.parse(config) as CloudBackupConfig;
    } catch (error) {
      console.error("Failed to get cloud backup config:", error);
      throw new Error("Failed to retrieve cloud backup settings");
    }
  };

// Upload backup to cloud
export const uploadToCloud = async (
  fileName: string,
  provider: CloudBackupConfig["provider"]
): Promise<boolean> => {
  try {
    // This is a mock implementation that would be replaced with actual cloud provider SDKs
    if (provider === "none") {
      throw new Error("No cloud provider selected");
    }

    const filePath = `${BACKUP_DIRECTORY}${fileName}`;
    const fileExists = await FileSystem.getInfoAsync(filePath);

    if (!fileExists.exists) {
      throw new Error("Backup file not found");
    }

    // Simulate uploading with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update last sync date
    await updateLastSyncDate();

    return true;
  } catch (error) {
    console.error(`Failed to upload to ${provider}:`, error);
    throw new Error(`Failed to upload to ${provider}`);
  }
};

// Download backup from cloud
export const downloadFromCloud = async (
  provider: CloudBackupConfig["provider"]
): Promise<string> => {
  try {
    // This is a mock implementation that would be replaced with actual cloud provider SDKs
    if (provider === "none") {
      throw new Error("No cloud provider selected");
    }

    // Simulate downloading with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `cloud-backup-${timestamp}.json`;
    const filePath = `${BACKUP_DIRECTORY}${fileName}`;

    // For mock implementation, we'll create a copy of the latest backup
    const backups = await getBackups();
    if (backups.length === 0) {
      throw new Error("No backups found to simulate download");
    }

    const latestBackup = backups[0];
    const sourceFilePath = `${BACKUP_DIRECTORY}${latestBackup.fileName}`;

    await FileSystem.copyAsync({
      from: sourceFilePath,
      to: filePath,
    });

    return fileName;
  } catch (error) {
    console.error(`Failed to download from ${provider}:`, error);
    throw new Error(`Failed to download from ${provider}`);
  }
};

// Update the last sync date in the config
const updateLastSyncDate = async (): Promise<void> => {
  try {
    const config = await getCloudBackupConfig();
    if (config) {
      config.lastSyncDate = new Date().toISOString();
      await setCloudBackupConfig(config);
    }
  } catch (error) {
    console.error("Failed to update last sync date:", error);
  }
};

// Check if cloud sync is needed based on frequency
export const shouldRunCloudSync = async (): Promise<boolean> => {
  try {
    const config = await getCloudBackupConfig();

    if (
      !config ||
      !config.autoSync ||
      !config.lastSyncDate ||
      config.provider === "none"
    ) {
      return config?.autoSync ?? false;
    }

    const lastSync = new Date(config.lastSyncDate);
    const now = new Date();

    switch (config.syncFrequency) {
      case "daily":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return lastSync < yesterday;

      case "weekly":
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return lastSync < lastWeek;

      case "monthly":
        return (
          lastSync.getMonth() !== now.getMonth() ||
          lastSync.getFullYear() !== now.getFullYear()
        );

      default:
        return false;
    }
  } catch (error) {
    console.error("Failed to check cloud sync schedule:", error);
    return false;
  }
};

// Run cloud sync if needed based on configuration
export const runCloudSyncIfNeeded = async (): Promise<boolean> => {
  try {
    const shouldSync = await shouldRunCloudSync();

    if (!shouldSync) {
      return false;
    }

    // Create a new backup
    const backup = await createBackup("cloud-sync");

    // Get cloud config
    const config = await getCloudBackupConfig();
    if (!config || config.provider === "none") return false;

    // Upload to cloud
    await uploadToCloud(backup.fileName, config.provider);

    return true;
  } catch (error) {
    console.error("Failed to run cloud sync:", error);
    return false;
  }
};

// Authenticate with cloud provider
export const authenticateCloudProvider = async (
  provider: CloudBackupConfig["provider"]
): Promise<{ userId: string; email: string }> => {
  try {
    // This is a mock implementation that would be replaced with actual OAuth flows
    if (provider === "none") {
      throw new Error("No cloud provider selected");
    }

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock successful authentication
    return {
      userId: `user-id-${Math.random().toString(36).substring(7)}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    };
  } catch (error) {
    console.error(`Failed to authenticate with ${provider}:`, error);
    throw new Error(`Failed to authenticate with ${provider}`);
  }
};

// Initialize a cloud provider and save the configuration
export const initializeCloudProvider = async (
  provider: CloudBackupConfig["provider"]
): Promise<CloudBackupConfig> => {
  try {
    if (provider === "none") {
      const config: CloudBackupConfig = {
        provider: "none",
        autoSync: false,
        syncFrequency: "daily",
      };

      await setCloudBackupConfig(config);
      return config;
    }

    // Authenticate with the cloud provider
    const { userId, email } = await authenticateCloudProvider(provider);

    // Create and save configuration
    const config: CloudBackupConfig = {
      provider,
      userId,
      email,
      autoSync: true,
      syncFrequency: "daily",
      lastSyncDate: new Date().toISOString(),
    };

    await setCloudBackupConfig(config);
    return config;
  } catch (error) {
    console.error(`Failed to initialize ${provider}:`, error);
    throw new Error(`Failed to set up ${provider} integration`);
  }
};

// Sync backup to cloud - creates a new backup and uploads it
export const syncToCloud = async (): Promise<boolean> => {
  try {
    // Get cloud config
    const config = await getCloudBackupConfig();
    if (!config || config.provider === "none") {
      throw new Error("No cloud provider configured");
    }

    // Create a new backup
    const backup = await createBackup("cloud-sync");

    // Upload to cloud
    await uploadToCloud(backup.fileName, config.provider);

    // Update last sync date
    await updateLastSyncDate();

    return true;
  } catch (error) {
    console.error("Failed to sync to cloud:", error);
    return false;
  }
};
