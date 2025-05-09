import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "../screens/SettingsScreen";
import BackupScreen from "../screens/BackupScreen";
import AutoBackupSettings from "../screens/AutoBackupSettings";
import CloudBackupScreen from "../screens/CloudBackupScreen";
import TimezoneSettingsScreen from "../screens/TimezoneSettingsScreen";

const Stack = createStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="AutoBackupSettings" component={AutoBackupSettings} />
      <Stack.Screen name="CloudBackup" component={CloudBackupScreen} />
      <Stack.Screen
        name="TimezoneSettings"
        component={TimezoneSettingsScreen}
      />
    </Stack.Navigator>
  );
}
