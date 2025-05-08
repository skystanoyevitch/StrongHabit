import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Animated,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as BackupUtils from "../utils/backupUtils";
import { theme } from "../constants/theme";
import { AnimatedTitle } from "../components/AnimatedTitle";

// Define our cloud provider types
type CloudProvider = "google-drive" | "dropbox" | "icloud" | "none";

// Mock cloud provider data
const cloudProviders = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "google-drive",
    color: "#4285F4",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "dropbox",
    color: "#0061FF",
  },
  {
    id: "icloud",
    name: "iCloud Drive",
    icon: "apple-icloud",
    color: "#3E89DD",
  },
];

const CloudBackupScreen: React.FC = () => {
  // State for cloud configuration
  const [cloudConfig, setCloudConfig] =
    useState<BackupUtils.CloudBackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<CloudProvider>("none");
  const [autoSync, setAutoSync] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Load cloud backup config when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCloudConfig();

      // Run entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Reset animations when leaving screen
        fadeAnim.setValue(0);
        translateY.setValue(20);
      };
    }, [])
  );

  // Load cloud configuration
  const loadCloudConfig = async () => {
    try {
      setLoading(true);
      const config = await BackupUtils.getCloudBackupConfig();

      if (config) {
        setCloudConfig(config);
        setSelectedProvider(config.provider);
        setAutoSync(config.autoSync);
      }
    } catch (error) {
      console.error("Failed to load cloud config:", error);
      Alert.alert("Error", "Failed to load cloud configuration");
    } finally {
      setLoading(false);
    }
  };

  // Toggle auto sync setting
  const toggleAutoSync = async (value: boolean) => {
    try {
      if (!cloudConfig || selectedProvider === "none") return;

      const updatedConfig: BackupUtils.CloudBackupConfig = {
        ...cloudConfig,
        autoSync: value,
      };

      await BackupUtils.setCloudBackupConfig(updatedConfig);
      setAutoSync(value);
      setCloudConfig(updatedConfig);
    } catch (error) {
      console.error("Failed to update auto sync setting:", error);
      Alert.alert("Error", "Failed to update auto sync setting");
    }
  };

  // Connect to a cloud provider
  const connectToProvider = async (provider: CloudProvider) => {
    try {
      if (provider === "none") {
        // Disconnect from current provider
        if (cloudConfig) {
          const updatedConfig: BackupUtils.CloudBackupConfig = {
            provider: "none",
            autoSync: false,
            syncFrequency: cloudConfig.syncFrequency || "daily",
          };

          await BackupUtils.setCloudBackupConfig(updatedConfig);
          setCloudConfig(updatedConfig);
          setSelectedProvider("none");
          setAutoSync(false);
        }
        return;
      }

      // In a real app, we would initiate OAuth flow here
      // For now, we'll just show a mock authentication dialog
      Alert.alert(
        `Connect to ${getProviderName(provider)}?`,
        `This will connect StrongHabit to your ${getProviderName(
          provider
        )} account.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Connect",
            onPress: async () => {
              setLoading(true);

              try {
                // Initialize the provider (mock implementation)
                const newConfig = await BackupUtils.initializeCloudProvider(
                  provider
                );

                setCloudConfig(newConfig);
                setSelectedProvider(provider);
                setAutoSync(newConfig.autoSync);

                Alert.alert(
                  "Connected",
                  `Your habits will now be backed up to ${getProviderName(
                    provider
                  )}.`
                );
              } catch (error) {
                console.error(`Failed to connect to ${provider}:`, error);
                Alert.alert(
                  "Connection Failed",
                  `Could not connect to ${getProviderName(provider)}.`
                );
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to connect to provider:", error);
      Alert.alert("Error", "Failed to connect to cloud provider");
    }
  };

  // Get provider name from ID
  const getProviderName = (providerId: CloudProvider): string => {
    const provider = cloudProviders.find((p) => p.id === providerId);
    return provider ? provider.name : "Unknown Provider";
  };

  // Get provider icon from ID
  const getProviderIcon = (providerId: CloudProvider): string => {
    const provider = cloudProviders.find((p) => p.id === providerId);
    return provider ? provider.icon : "cloud-question";
  };

  // Get provider color from ID
  const getProviderColor = (providerId: CloudProvider): string => {
    const provider = cloudProviders.find((p) => p.id === providerId);
    return provider ? provider.color : theme.colors.accent;
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleString();
    }
  };

  // Sync now function
  const syncNow = async () => {
    if (
      !cloudConfig ||
      cloudConfig.provider === "none" ||
      !cloudConfig.autoSync
    ) {
      Alert.alert(
        "No Cloud Provider",
        "Please connect to a cloud provider first."
      );
      return;
    }

    try {
      setSyncing(true);
      const success = await BackupUtils.syncToCloud();

      if (success) {
        // Reload config to get updated last sync date
        const updatedConfig = await BackupUtils.getCloudBackupConfig();
        setCloudConfig(updatedConfig);

        Alert.alert(
          "Sync Complete",
          "Your backups have been synced to the cloud."
        );
      } else {
        Alert.alert(
          "Sync Issue",
          "Some backups could not be synced. Please try again."
        );
      }
    } catch (error) {
      console.error("Failed to sync to cloud:", error);
      Alert.alert(
        "Sync Failed",
        "An error occurred while syncing to the cloud."
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AnimatedTitle text="Cloud Backup" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Cloud Provider</Text>
          <Text style={styles.sectionDescription}>
            Connect to a cloud storage provider to automatically backup your
            habit data to the cloud.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                Loading cloud configuration...
              </Text>
            </View>
          ) : (
            <>
              {cloudProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider === provider.id &&
                      styles.selectedProviderCard,
                  ]}
                  onPress={() =>
                    connectToProvider(provider.id as CloudProvider)
                  }
                >
                  <View
                    style={[
                      styles.providerIconContainer,
                      { backgroundColor: `${provider.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={provider.icon as any}
                      size={24}
                      color={provider.color}
                    />
                  </View>

                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerStatus}>
                      {selectedProvider === provider.id
                        ? cloudConfig?.email || "Connected"
                        : "Not connected"}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name={
                      selectedProvider === provider.id
                        ? "check-circle"
                        : "circle-outline"
                    }
                    size={24}
                    color={
                      selectedProvider === provider.id
                        ? theme.colors.success
                        : theme.colors.outline
                    }
                  />
                </TouchableOpacity>
              ))}

              {selectedProvider !== "none" && (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => connectToProvider("none")}
                >
                  <MaterialCommunityIcons
                    name="cloud-off-outline"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text style={styles.disconnectText}>
                    Disconnect from cloud
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>

        {selectedProvider !== "none" && cloudConfig?.autoSync && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.sectionTitle}>Cloud Sync Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Auto Sync Backups</Text>
                <Text style={styles.settingDescription}>
                  Automatically upload new backups to{" "}
                  {getProviderName(selectedProvider)}
                </Text>
              </View>

              <Switch
                value={autoSync}
                onValueChange={toggleAutoSync}
                trackColor={{
                  false: "#d0d0d0",
                  true: `${theme.colors.primary}88`,
                }}
                thumbColor={autoSync ? theme.colors.primary : "#f4f4f4"}
                ios_backgroundColor="#d0d0d0"
              />
            </View>

            <View style={styles.syncInfo}>
              <Text style={styles.syncInfoText}>
                Last sync: {formatDate(cloudConfig?.lastSyncDate)}
              </Text>

              <TouchableOpacity
                style={[styles.syncButton, syncing && styles.syncingButton]}
                onPress={syncNow}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="cloud-sync"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.sectionTitle}>About Cloud Backup</Text>
          <Text style={styles.aboutText}>
            Cloud backup allows you to store your habit data securely in the
            cloud, making it easy to recover if you change devices or uninstall
            the app.
          </Text>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.featureText}>
              End-to-end encryption for your data
            </Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="devices"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.featureText}>Sync across multiple devices</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.featureText}>
              Automatic versioning and backup history
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginTop: 12,
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline + "30",
  },
  selectedProviderCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "08",
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  providerStatus: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    padding: 12,
  },
  disconnectText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + "20",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },
  syncInfo: {
    alignItems: "center",
  },
  syncInfoText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 16,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "80%",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  syncingButton: {
    opacity: 0.7,
  },
  syncButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  aboutText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 20,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
  },
});

export default CloudBackupScreen;
