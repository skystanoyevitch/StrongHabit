import React, { useEffect, useContext } from "react"; // Import useContext
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
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadSettings();
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

        <SettingsSection title="Data">
          <View style={styles.setting}>
            <View>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            <MaterialCommunityIcons name="export" size={24} color="#999" />
          </View>

          <View style={styles.setting}>
            <View>
              <Text style={styles.settingLabel}>Backup Data</Text>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            <MaterialCommunityIcons
              name="cloud-upload"
              size={24}
              color="#999"
            />
          </View>
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

        <SettingsSection title="Data Management">
          <View style={styles.setting}>
            <View>
              <Text style={styles.settingLabel}>Restore from Backup</Text>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            <MaterialCommunityIcons name="restore" size={24} color="#999" />
          </View>

          <View style={styles.setting}>
            <View>
              <Text style={styles.settingLabel}>Cleanup Old Data</Text>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            <MaterialCommunityIcons name="trash-can" size={24} color="#999" />
          </View>
        </SettingsSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>StrongHabit v1.0.0</Text>
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
  comingSoonText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 12,
    color: theme.colors.secondaryText, // Use theme secondary text color
    fontStyle: "italic",
  },
  settingValue: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.secondaryText, // Use theme secondary text color
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  versionText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 14,
    color: theme.colors.secondaryText, // Use theme secondary text color
  },
});

export default SettingsScreen;
