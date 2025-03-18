import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { StorageData } from "../types/storage";
import { StorageService } from "./storage";
import * as DocumentPicker from "expo-document-picker";

export class DataManager {
  private static instance: DataManager;
  private storageService: StorageService;

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  async exportData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem("habits");
      if (!data) return false;

      const fileName = `stronghabit_backup_${new Date().toISOString()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Export Habits Data",
      });

      return true;
    } catch (error) {
      console.error("Export failed:", error);
      return false;
    }
  }

  async backupData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem("habits");
      if (!data) return false;

      const backupKey = `backup_${new Date().toISOString()}`;
      await AsyncStorage.setItem(backupKey, data);

      return true;
    } catch (error) {
      console.error("Backup failed:", error);
      return false;
    }
  }

  async restoreFromBackup(): Promise<boolean> {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (!result.canceled) {
        const response = await fetch(result.assets[0].uri);
        const backupData = await response.text();
        return await this.storageService.restoreData(backupData);
      }
      return false;
    } catch (error) {
      console.error("Restore failed:", error);
      return false;
    }
  }

  async cleanupOldData(): Promise<boolean> {
    try {
      await this.storageService.cleanupOldData();
      return true;
    } catch (error) {
      console.error("Cleanup failed:", error);
      return false;
    }
  }
}
