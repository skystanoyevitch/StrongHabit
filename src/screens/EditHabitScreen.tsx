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
import { DayOfWeek, Habit, HabitFrequency } from "../types/habit";
import { HabitError } from "../types/errors"; // Corrected import path
import { theme } from "../constants/theme"; // Import theme

interface FormValues {
  name: string;
  description: string;
  frequency: HabitFrequency;
  selectedDays: DayOfWeek[];
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
      } catch (e) {
        // Changed error variable name to 'e' to avoid conflict with state variable
        console.error("Failed to update habit:", e);
        const errorMessage =
          e instanceof HabitError
            ? e.message
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
    selectedDays: habit.selectedDays || [],
    reminderTime: habit.reminderTime || null,
    reminderEnabled: habit.reminder ?? false,
    color: habit.color ?? "#000000",
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <AnimatedTitle text="Edit Habit" /> */}

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
    backgroundColor: theme.colors.background, // Use theme background
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffebee",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    color: theme.colors.error, // Use theme error color
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text, // Use theme text color
  },
});
