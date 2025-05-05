import "react-native-gesture-handler";
import "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./src/navigation/TabNavigator";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { PermanentMarker_400Regular } from "@expo-google-fonts/permanent-marker";
import ErrorBoundary from "./src/components/ErrorBoundary";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    DancingScript_700Bold,
    BebasNeue_400Regular,
    PermanentMarker_400Regular,
  });

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>StrongHabit</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
});
