import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import HabitDetailScreen from "../screens/HabitDetailScreen";
import EditHabitScreen from "../screens/EditHabitScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import BackupScreen from "../screens/BackupScreen";
import AutoBackupSettings from "../screens/AutoBackupSettings";

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // This adds or removes all headers
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <Stack.Screen name="EditHabit" component={EditHabitScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="AutoBackupSettings" component={AutoBackupSettings} />
    </Stack.Navigator>
  );
}
