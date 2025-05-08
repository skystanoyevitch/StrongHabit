import React, { useEffect, useContext, useState } from "react"; // Added useState import
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  toggleNotifications,
  getNotificationStatus,
} from "../utils/notifications";
import { DataManager } from "../utils/dataManager";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "../contexts/ThemeContext"; // Import useThemeContext
import { theme } from "../constants/theme"; // Import theme
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import * as BackupUtils from "../utils/backupUtils";

// Define the navigation param list for Settings stack
type SettingsStackParamList = {
  SettingsScreen: undefined;
  Backup: undefined;
  AutoBackupSettings: undefined;
  CloudBackup: undefined;
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const { themeMode, setThemeMode } = useThemeContext(); // Get theme context
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadSettings();

    // Initialize backup system when settings screen loads
    BackupUtils.initializeBackupSystem().catch((error) => {
      console.error("Failed to initialize backup system:", error);
    });

    // Check for auto backup needs
    BackupUtils.runAutoBackupIfNeeded().catch((error) => {
      console.error("Auto backup check failed:", error);
    });
  }, []);

  const loadSettings = async () => {
    const status = await getNotificationStatus();
    setNotificationsEnabled(status);
  };

  const handleNotificationToggle = async (value: boolean) => {
    const success = await toggleNotifications(value);
    if (success) {
      setNotificationsEnabled(value);
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://www.skystanoyevitch.com/strong-habit/privacy");
  };

  const handleTerms = () => {
    Linking.openURL("https://www.skystanoyevitch.com/strong-habit/terms");
  };

  const handleExportData = async () => {
    const success = await dataManager.exportData();
    if (success) {
      Alert.alert("Success", "Data exported successfully");
    } else {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleBackupData = async () => {
    const success = await dataManager.backupData();
    if (success) {
      Alert.alert("Success", "Data backed up successfully");
    } else {
      Alert.alert("Error", "Failed to backup data");
    }
  };

  const handleRestoreData = async () => {
    Alert.alert(
      "Restore Data",
      "This will replace your current data. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          onPress: async () => {
            const success = await dataManager.restoreFromBackup();
            if (success) {
              Alert.alert("Success", "Data restored successfully");
            } else {
              Alert.alert("Error", "Failed to restore data");
            }
          },
        },
      ]
    );
  };

  const handleCleanup = async () => {
    Alert.alert(
      "Cleanup Old Data",
      "This will remove data older than 1 year. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Cleanup",
          onPress: async () => {
            const success = await dataManager.cleanupOldData();
            if (success) {
              Alert.alert("Success", "Old data cleaned up successfully");
            } else {
              Alert.alert("Error", "Failed to cleanup data");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <SettingsSection title="Appearance">
          <TouchableOpacity
            style={styles.setting}
            onPress={() => setThemeMode("light")}
          >
            <Text style={styles.settingLabel}>Light</Text>
            <MaterialCommunityIcons
              name={
                themeMode === "light" ? "radiobox-marked" : "radiobox-blank"
              }
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.setting}
            onPress={() => setThemeMode("dark")}
          >
            <Text style={styles.settingLabel}>Dark</Text>
            <MaterialCommunityIcons
              name={themeMode === "dark" ? "radiobox-marked" : "radiobox-blank"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.setting}
            onPress={() => setThemeMode("system")}
          >
            <Text style={styles.settingLabel}>System</Text>
            <MaterialCommunityIcons
              name={
                themeMode === "system" ? "radiobox-marked" : "radiobox-blank"
              }
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection title="Notifications">
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Enable Reminders</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
          </View>
        </SettingsSection>

        <SettingsSection title="Data Management">
          <TouchableOpacity
            style={styles.setting}
            onPress={() => navigation.navigate("Backup")}
          >
            <View>
              <Text style={styles.settingLabel}>Backups</Text>
              <Text style={styles.settingDescription}>
                Create and manage backups of your habit data
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setting}
            onPress={() => navigation.navigate("AutoBackupSettings")}
          >
            <View>
              <Text style={styles.settingLabel}>Automatic Backups</Text>
              <Text style={styles.settingDescription}>
                Configure automatic backup schedule
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setting}
            onPress={() => navigation.navigate("CloudBackup")}
          >
            <View>
              <Text style={styles.settingLabel}>Cloud Backup</Text>
              <Text style={styles.settingDescription}>
                Sync your data to cloud storage services
              </Text>
            </View>
            <MaterialCommunityIcons
              name="cloud-upload"
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setting}
            onPress={async () => {
              try {
                const result = await BackupUtils.importBackup();
                if (result) {
                  Alert.alert("Success", "Data imported successfully");
                }
              } catch (error) {
                Alert.alert("Error", "Failed to import data");
                console.error(error);
              }
            }}
          >
            <View>
              <Text style={styles.settingLabel}>Import Data</Text>
              <Text style={styles.settingDescription}>
                Restore habits from an external backup
              </Text>
            </View>
            <MaterialCommunityIcons name="file-import" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setting}
            onPress={async () => {
              Alert.alert(
                "Create Data Export",
                "This will create a backup file and share it with other apps",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Export",
                    onPress: async () => {
                      try {
                        const backup = await BackupUtils.createBackup("export");
                        await BackupUtils.shareBackup(backup.fileName);
                      } catch (error) {
                        Alert.alert("Error", "Failed to export data");
                        console.error(error);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <View>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Share your habit data with other apps
              </Text>
            </View>
            <MaterialCommunityIcons name="export" size={24} color="#666" />
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection title="App Info">
          <TouchableOpacity
            style={styles.setting}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.setting} onPress={handleTerms}>
            <Text style={styles.settingLabel}>Terms and Conditions</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>StrongHabit v1.0.6</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme background
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  section: {
    marginVertical: 16,
    backgroundColor: theme.colors.surface, // Use theme surface color
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 20,
    color: theme.colors.text, // Use theme text color
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16, // Added padding to align with settings items
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outline, // Use theme outline color
  },
  settingLabel: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.text, // Use theme text color
  },
  settingDescription: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 12,
    color: theme.colors.secondaryText, // Use theme secondary text color
    marginTop: 4,
  },
  settingValue: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.secondaryText, // Use theme secondary text color
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    color: theme.colors.secondaryText, // Use theme secondary text color
  },
});

export default SettingsScreen;
