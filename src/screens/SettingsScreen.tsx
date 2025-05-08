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
import Animated, { FadeInDown } from "react-native-reanimated"; // Import animations

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
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.headerContainer}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="cog"
            size={36}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your app experience and manage your data
        </Text>
      </Animated.View>

      <ScrollView style={styles.scrollContainer}>
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
              color={theme.colors.primary}
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
              color={theme.colors.primary}
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
              color={theme.colors.primary}
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
          <Text style={styles.versionText}>StrongHabit v1.0.7</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: theme.fonts.titleBold,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 16,
    textAlign: "center",
    maxWidth: "90%",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outline,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outline,
  },
  settingLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
  },
  settingDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginTop: 4,
  },
  settingValue: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    padding: 12,
  },
  versionText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
});

export default SettingsScreen;
