import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as BackupUtils from "../utils/backupUtils";
import { theme } from "../constants/theme";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { BackButton } from "../components/BackButton";

type FrequencyOption = "daily" | "weekly" | "monthly";
type RetentionOption = 3 | 5 | 10 | 20;

const AutoBackupSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyOption>("weekly");
  const [retention, setRetention] = useState<RetentionOption>(5);
  const [lastBackupDate, setLastBackupDate] = useState<string | undefined>(
    undefined
  );

  const navigation = useNavigation();

  // Load current backup settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const config = await BackupUtils.getAutoBackupConfig();

      if (config) {
        setEnabled(config.enabled);
        setFrequency(config.frequency);
        setRetention(config.retention as RetentionOption);
        setLastBackupDate(config.lastBackupDate);
      } else {
        // Default settings
        setEnabled(false);
        setFrequency("weekly");
        setRetention(5);
      }
    } catch (error) {
      console.error("Failed to load auto backup settings:", error);
      Alert.alert("Error", "Failed to load auto backup settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await BackupUtils.setAutoBackupConfig({
        enabled,
        frequency,
        retention,
        lastBackupDate,
      });

      Alert.alert("Success", "Auto backup settings saved successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save auto backup settings:", error);
      Alert.alert("Error", "Failed to save auto backup settings");
    } finally {
      setSaving(false);
    }
  };

  const formatLastBackupDate = () => {
    if (!lastBackupDate) return "Never";

    const date = new Date(lastBackupDate);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedTitle text="Auto Backup Settings" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <BackButton />
      <ScrollView style={styles.scrollView}>
        <AnimatedTitle text="Auto Backup Settings" />

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Enable Auto Backup</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: "#767577", true: theme.colors.primary }}
            />
          </View>

          <Text style={styles.description}>
            Automatically create backups of your habit data on a regular
            schedule
          </Text>
        </View>

        {enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Backup Frequency</Text>
              <Text style={styles.description}>
                How often should automatic backups be created?
              </Text>

              <TouchableOpacity
                style={[
                  styles.option,
                  frequency === "daily" && styles.selectedOption,
                ]}
                onPress={() => setFrequency("daily")}
              >
                <MaterialCommunityIcons
                  name={
                    frequency === "daily" ? "radiobox-marked" : "radiobox-blank"
                  }
                  size={24}
                  color={
                    frequency === "daily"
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                />
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionText,
                      frequency === "daily" && styles.selectedOptionText,
                    ]}
                  >
                    Daily
                  </Text>
                  <Text style={styles.optionDescription}>
                    Create a backup once every day
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  frequency === "weekly" && styles.selectedOption,
                ]}
                onPress={() => setFrequency("weekly")}
              >
                <MaterialCommunityIcons
                  name={
                    frequency === "weekly"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  size={24}
                  color={
                    frequency === "weekly"
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                />
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionText,
                      frequency === "weekly" && styles.selectedOptionText,
                    ]}
                  >
                    Weekly
                  </Text>
                  <Text style={styles.optionDescription}>
                    Create a backup once every week
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  frequency === "monthly" && styles.selectedOption,
                ]}
                onPress={() => setFrequency("monthly")}
              >
                <MaterialCommunityIcons
                  name={
                    frequency === "monthly"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  size={24}
                  color={
                    frequency === "monthly"
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                />
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionText,
                      frequency === "monthly" && styles.selectedOptionText,
                    ]}
                  >
                    Monthly
                  </Text>
                  <Text style={styles.optionDescription}>
                    Create a backup once every month
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Retention Policy</Text>
              <Text style={styles.description}>
                How many automatic backups should be kept?
              </Text>

              {[3, 5, 10, 20].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.option,
                    retention === value && styles.selectedOption,
                  ]}
                  onPress={() => setRetention(value as RetentionOption)}
                >
                  <MaterialCommunityIcons
                    name={
                      retention === value ? "radiobox-marked" : "radiobox-blank"
                    }
                    size={24}
                    color={
                      retention === value
                        ? theme.colors.primary
                        : theme.colors.secondaryText
                    }
                  />
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionText,
                        retention === value && styles.selectedOptionText,
                      ]}
                    >
                      {value} Backups
                    </Text>
                    <Text style={styles.optionDescription}>
                      Keep the {value} most recent automatic backups
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={styles.note}>
                Note: Older backups will be automatically deleted when the limit
                is reached
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last Backup</Text>
              <Text style={styles.lastBackupText}>
                {formatLastBackupDate()}
              </Text>

              <TouchableOpacity
                style={styles.runNowButton}
                onPress={async () => {
                  try {
                    setSaving(true);
                    const backup = await BackupUtils.createBackup("auto");
                    setLastBackupDate(backup.createdAt);
                    Alert.alert("Success", "Backup created successfully");
                  } catch (error) {
                    Alert.alert("Error", "Failed to create backup");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="backup-restore"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.runNowText}>Run Backup Now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginTop: 12,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary + "10", // 10% opacity
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },
  note: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    fontStyle: "italic",
    color: theme.colors.secondaryText,
    marginTop: 8,
  },
  lastBackupText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
  },
  runNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  runNowText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
  },
  saveButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: "#fff",
  },
});

export default AutoBackupSettings;
