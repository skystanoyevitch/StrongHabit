import React from "react";
import { View, StyleSheet, SafeAreaView, Alert, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HabitForm } from "../components/HabitForm";
import { StorageService } from "../utils/storage";
import { Habit } from "../types/habit";
import { theme } from "../constants/theme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function AddHabitScreen() {
  const navigation = useNavigation();
  const storageService = StorageService.getInstance();

  // Handle form submission
  const handleSubmit = async (
    habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completionLogs">
  ) => {
    try {
      await storageService.addHabit(habitData);
      Alert.alert(
        "Habit Created",
        "Your new habit has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home" as never),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create habit:", error);
      Alert.alert("Error", "There was a problem creating your habit");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.headerContainer}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={36}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.headerTitle}>Create New Habit</Text>
        <Text style={styles.headerSubtitle}>
          Define your new habit and start building consistency
        </Text>
      </Animated.View>
      <HabitForm onSubmit={handleSubmit} onCancel={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

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
});
