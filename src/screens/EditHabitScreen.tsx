import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { StorageService } from "../utils/storage";
import { HabitForm } from "../components/HabitForm";
import { Habit, HabitFrequency } from "../types/habit";
import { HabitError } from "../types/errors";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface FormValues {
  name: string;
  description: string;
  frequency: HabitFrequency;
  reminderTime?: string | null;
  reminderEnabled: boolean;
  color: string;
}

export default function EditHabitScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "EditHabit">>();
  const { habit } = route.params;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const storageService = StorageService.getInstance();

  // const validateForm = (values: FormValues): boolean => {
  //   if (!values.name.trim()) {
  //     setError("Name is required");
  //     return false;
  //   }
  //   if (!values.description.trim()) {
  //     setError("Description is required");
  //     return false;
  //   }
  //   return true;
  // };

  const validateForm = (values: FormValues): boolean => {
    if (!values.name.trim()) {
      setError("Name is required");
      return false;
    }
    // Remove the description validation since it's optional
    return true;
  };

  const handleSubmit = useCallback(
    async (values: FormValues): Promise<void> => {
      setError(null);
      if (!validateForm(values)) return;

      setLoading(true);
      try {
        const updatedHabit: Habit = {
          ...habit,
          ...values,
          updatedAt: new Date().toISOString(),
        };

        await storageService.updateHabit(updatedHabit);
        Alert.alert("Success", "Habit updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.error("Failed to update habit:", error);
        const errorMessage =
          error instanceof HabitError
            ? error.message
            : "Failed to update habit. Please try again.";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [habit, navigation, storageService]
  );

  const initialValues: FormValues = {
    name: habit.name || "",
    description: habit.description || "",
    frequency: habit.frequency || "daily",
    reminderTime: habit.reminderTime || null,
    reminderEnabled: habit.reminder ?? false,
    color: habit.color ?? "#000000",
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <AnimatedTitle text="Edit Habit" />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Updating habit...</Text>
        </View>
      ) : (
        <HabitForm
          onSubmit={handleSubmit}
          onCancel={() => navigation.goBack()}
          initialValues={initialValues}
          isEditing={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffebee",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
