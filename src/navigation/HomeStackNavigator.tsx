import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import HabitDetailScreen from "../screens/HabitDetailScreen";

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
    </Stack.Navigator>
  );
}
