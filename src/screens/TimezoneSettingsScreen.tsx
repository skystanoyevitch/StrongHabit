import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTimezoneOffset, setTimezoneOffset } from "../utils/dateUtils";
import { theme } from "../constants/theme";
import { getAccessibilityProps } from "../utils/accessibilityUtils";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type TimezoneSettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function TimezoneSettingsScreen({
  navigation,
}: TimezoneSettingsScreenProps) {
  const [timezoneOffset, setOffset] = useState<number>(0);
  const [useDeviceTimezone, setUseDeviceTimezone] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Load current timezone settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const deviceOffset = new Date().getTimezoneOffset();
        const userOffset = await getTimezoneOffset();

        setOffset(userOffset);
        setUseDeviceTimezone(userOffset === deviceOffset);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load timezone settings:", error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save timezone settings
  const saveSettings = async () => {
    try {
      if (useDeviceTimezone) {
        // Use device timezone
        const deviceOffset = new Date().getTimezoneOffset();
        await setTimezoneOffset(deviceOffset);
        setOffset(deviceOffset);
      } else {
        // Use custom timezone
        await setTimezoneOffset(timezoneOffset);
      }

      Alert.alert("Settings Saved", "Timezone settings have been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save timezone settings.");
    }
  };

  // Handle timezone offset change
  const handleOffsetChange = (hours: number) => {
    setUseDeviceTimezone(false);
    setOffset(hours * 60); // Convert hours to minutes
  };

  // Toggle between device timezone and custom timezone
  const toggleDeviceTimezone = () => {
    if (!useDeviceTimezone) {
      // Switching to device timezone
      setOffset(new Date().getTimezoneOffset());
    }
    setUseDeviceTimezone(!useDeviceTimezone);
  };

  // Format timezone offset for display
  const formatOffset = (offsetMinutes: number) => {
    const sign = offsetMinutes <= 0 ? "+" : "-";
    const hours = Math.abs(Math.floor(offsetMinutes / 60));
    const minutes = Math.abs(offsetMinutes % 60);
    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Timezone Settings</Text>
        <Text style={styles.description}>
          Adjust your timezone settings to ensure accurate habit tracking and
          streak calculations.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Timezone</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Use device timezone</Text>
            <Switch
              value={useDeviceTimezone}
              onValueChange={toggleDeviceTimezone}
              trackColor={{ false: "#767577", true: theme.colors.primary }}
              thumbColor="#f4f3f4"
              {...getAccessibilityProps(
                "Use device timezone",
                "Double tap to toggle device timezone",
                "checkbox"
              )}
            />
          </View>
        </View>

        {!useDeviceTimezone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Timezone</Text>
            <Text style={styles.currentTimezone}>
              Current: {formatOffset(timezoneOffset)}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timezonesContainer}
            >
              {[
                -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3,
                4, 5, 6, 7, 8, 9, 10, 11, 12,
              ].map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timezoneButton,
                    timezoneOffset === hour * -60 && styles.selectedTimezone,
                  ]}
                  onPress={() => handleOffsetChange(hour * -1)}
                  {...getAccessibilityProps(
                    `Timezone UTC${
                      hour <= 0 ? "+" + Math.abs(hour) : "-" + hour
                    }`,
                    "Double tap to select this timezone",
                    "button"
                  )}
                >
                  <Text
                    style={[
                      styles.timezoneText,
                      timezoneOffset === hour * -60 &&
                        styles.selectedTimezoneText,
                    ]}
                  >
                    {hour <= 0 ? `+${Math.abs(hour)}` : `-${hour}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            Your habits' completion and streak calculations will be based on the
            selected timezone. This helps ensure consistency when tracking
            habits across different timezones.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          {...getAccessibilityProps(
            "Save timezone settings",
            "Double tap to save your timezone settings",
            "button"
          )}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  currentTimezone: {
    fontSize: 16,
    marginBottom: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  timezonesContainer: {
    paddingVertical: 10,
  },
  timezoneButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 5,
  },
  selectedTimezone: {
    backgroundColor: theme.colors.primary,
  },
  timezoneText: {
    fontSize: 16,
    color: "#333",
    fontFamily: theme.fonts.medium,
  },
  selectedTimezoneText: {
    color: "#fff",
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#e8f4fd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: theme.fonts.semibold,
  },
});
