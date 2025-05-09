import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as BackupUtils from "../utils/backupUtils";
import { theme } from "../constants/theme";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { BackButton } from "../components/BackButton"; // Import BackButton component
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

const { width } = Dimensions.get("window");

const BackupScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [backups, setBackups] = useState<BackupUtils.BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  // Load backups when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadBackups();

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Reset animations when leaving screen
        fadeAnim.setValue(0);
        translateYAnim.setValue(20);
      };
    }, [])
  );

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupList = await BackupUtils.getBackups();
      setBackups(backupList);
    } catch (error) {
      Alert.alert("Error", "Failed to load backups");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBackups();
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const newBackup = await BackupUtils.createBackup();

      // Add with animation
      setBackups((prevBackups) => [newBackup, ...prevBackups]);

      // Show success indicator
      Alert.alert(
        "Backup Created",
        `Your habit data has been successfully backed up.\n\nFile: ${newBackup.fileName}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create backup");
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleShareBackup = async (fileName: string) => {
    try {
      await BackupUtils.shareBackup(fileName);
    } catch (error) {
      Alert.alert("Error", "Failed to share backup");
      console.error(error);
    }
  };

  const handleDeleteBackup = async (backup: BackupUtils.BackupMetadata) => {
    Alert.alert(
      "Delete Backup",
      "Are you sure you want to delete this backup?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await BackupUtils.deleteBackup(backup.fileName);

              // Remove with animation
              setBackups(backups.filter((b) => b.id !== backup.id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete backup");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleRestoreBackup = async (backup: BackupUtils.BackupMetadata) => {
    Alert.alert(
      "Restore Backup",
      "This will replace all your current data. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          style: "default",
          onPress: async () => {
            try {
              // Since we're restoring from a file we already have, we need to open it directly
              const result = await BackupUtils.restoreFromFile(backup.fileName);
              if (result) {
                Alert.alert(
                  "Success",
                  "Your habits have been restored successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => loadBackups(), // Refresh list after restore
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to restore backup");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Check if it's today or yesterday
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
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
      return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  // Format size in a human-readable way (KB, MB)
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Separate component for each backup item to properly use hooks
  const BackupItem = React.memo(
    ({ item, index }: { item: BackupUtils.BackupMetadata; index: number }) => {
      // Staggered animation for list items
      const itemFadeAnim = useRef(new Animated.Value(0)).current;
      const itemTranslateYAnim = useRef(new Animated.Value(20)).current;

      useEffect(() => {
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(itemTranslateYAnim, {
            toValue: 0,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, [index]);

      // Display appropriate icons based on the filename
      const isAutoBackup = item.fileName.includes("auto-");
      const isExportBackup = item.fileName.includes("export-");

      let backupTypeIcon: "file-document" | "clock-outline" | "export" =
        "file-document";
      let backupTypeColor = theme.colors.primary;

      if (isAutoBackup) {
        backupTypeIcon = "clock-outline";
        backupTypeColor = theme.colors.success;
      } else if (isExportBackup) {
        backupTypeIcon = "export";
        backupTypeColor = theme.colors.accent;
      }

      return (
        <Animated.View
          style={[
            styles.backupItemContainer,
            {
              opacity: itemFadeAnim,
              transform: [{ translateY: itemTranslateYAnim }],
            },
          ]}
        >
          <View style={styles.backupItem}>
            <View style={styles.backupIconContainer}>
              <MaterialCommunityIcons
                name={backupTypeIcon}
                size={24}
                color={backupTypeColor}
              />
            </View>

            <View style={styles.backupInfo}>
              <Text style={styles.backupName} numberOfLines={1}>
                {item.fileName.replace(/^(auto|export)-/, "")}
              </Text>

              <View style={styles.backupDetails}>
                <Text style={styles.backupDate}>
                  {formatDate(item.createdAt)}
                </Text>
                <Text style={styles.backupMetaInfo}>
                  {item.habitCount} {item.habitCount === 1 ? "habit" : "habits"}{" "}
                  · {formatSize(item.size)}
                </Text>
              </View>
            </View>

            <View style={styles.backupActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonRestore]}
                onPress={() => handleRestoreBackup(item)}
              >
                <MaterialCommunityIcons name="restore" size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonShare]}
                onPress={() => handleShareBackup(item.fileName)}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDelete]}
                onPress={() => handleDeleteBackup(item)}
              >
                <MaterialCommunityIcons name="delete" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }
  );

  // Simplified renderItem function that uses the proper component
  const renderBackupItem = (props: {
    item: BackupUtils.BackupMetadata;
    index: number;
  }) => {
    return <BackupItem item={props.item} index={props.index} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      <AnimatedTitle text="Backups" />

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="backup-restore"
            size={36}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.headerTitle}>Backups</Text>
        <Text style={styles.headerSubtitle}>
          Create and manage backups of your habit data
        </Text>

        <TouchableOpacity
          style={[styles.createButton, creating && styles.disabledButton]}
          onPress={handleCreateBackup}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="backup-restore"
                size={20}
                color="#fff"
              />
              <Text style={styles.createButtonText}>Create Backup</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.importButton}
          onPress={async () => {
            try {
              const result = await BackupUtils.importBackup();
              if (result) {
                Alert.alert("Success", "Backup imported successfully");
                loadBackups(); // Refresh the list after import
              }
            } catch (error) {
              Alert.alert("Error", "Failed to import backup");
              console.error(error);
            }
          }}
        >
          <MaterialCommunityIcons
            name="file-import"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.importButtonText}>Import Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cloudButton}
          onPress={() => navigation.navigate("CloudBackupScreen")}
        >
          <MaterialCommunityIcons
            name="cloud"
            size={20}
            color={theme.colors.accent}
          />
          <Text style={styles.cloudButtonText}>Cloud Backup</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.divider} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading backups...</Text>
        </View>
      ) : backups.length === 0 ? (
        <Animated.View
          style={[
            styles.emptyContainer,
            { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={70}
            color={theme.colors.outline}
          />
          <Text style={styles.emptyTitle}>No Backups Found</Text>
          <Text style={styles.emptyText}>
            Create your first backup to secure your habit data
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={backups}
          renderItem={renderBackupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginBottom: 20,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  createButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  importButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: 10,
  },
  cloudButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  cloudButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.accent,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outline,
    marginVertical: 8,
    opacity: 0.5,
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
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 20,
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.secondaryText,
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  backupItemContainer: {
    marginBottom: 12,
  },
  backupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  backupDetails: {},
  backupDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  backupMetaInfo: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },
  backupActions: {
    flexDirection: "column",
    justifyContent: "space-between",
    height: 100,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonRestore: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonShare: {
    backgroundColor: theme.colors.accent,
  },
  actionButtonDelete: {
    backgroundColor: theme.colors.error,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    textAlign: "center",
    marginHorizontal: 20,
  },
});

export default BackupScreen;
