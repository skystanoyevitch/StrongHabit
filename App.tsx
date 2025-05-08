import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useThemeContext } from "./src/contexts/ThemeContext";
import TabNavigator from "./src/navigation/TabNavigator";
import { setupNotifications } from "./src/utils/notifications"; // Changed from initializeNotifications
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native"; // Added import
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { theme } from "./src/constants/theme"; // Import theme
import * as BackupUtils from "./src/utils/backupUtils"; // Import backup utilities
import { StorageService } from "./src/utils/storage"; // Import StorageService

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { paperTheme: theme, navigationTheme } = useThemeContext(); // Get theme and navigationTheme

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepareApp() {
      try {
        // Initialize notifications
        await setupNotifications();

        // Initialize storage service
        const storageService = StorageService.getInstance();
        await storageService.initialize();

        // Initialize backup system and run auto backup check
        await BackupUtils.initializeBackupSystem();
        await BackupUtils.runAutoBackupIfNeeded();
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen when fonts and theme are loaded
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepareApp();
  }, [fontsLoaded, fontError]); // Depend on fontsLoaded and fontError

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
      // Optionally, hide splash screen here too if you don't want to get stuck
      // SplashScreen.hideAsync();
    }
  }, [fontError]);

  if (!fontsLoaded) {
    // Changed condition: removed isThemeLoading
    // Show a loading indicator or return null while fonts/theme are loading
    // You can use the same splash screen or a custom loading component
    return (
      <View style={styles.loadingContainer}>
        {/* Use theme color for ActivityIndicator if theme is available, otherwise default */}
        <ActivityIndicator
          size="large"
          color={theme ? theme.colors.primary : undefined}
        />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer theme={navigationTheme}>
        {" "}
        {/* Pass navigationTheme to NavigationContainer */}
        <TabNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

// New component to handle theming for the gradient and main content
function MainAppWrapper() {
  const { paperTheme } = useThemeContext(); // Called within ThemeProvider's scope

  // Ensure backgroundGradient exists and has at least two colors, otherwise provide defaults
  // const gradientColors =
  //   paperTheme.colors.backgroundGradient &&
  //   paperTheme.colors.backgroundGradient.length >= 2
  //     ? paperTheme.colors.backgroundGradient
  //     : ["#F0F8FF", "#FFF0F5"]; // Default gradient

  return (
    // <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <AppContent />
      <StatusBar style="auto" />{" "}
      {/* Explicitly set StatusBar style or use theme */}
    </View>
    // </LinearGradient>
  );
}

export default function App() {
  // App no longer calls useThemeContext directly or sets up LinearGradient here
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <MainAppWrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: theme.fonts.regular, // Use Inter Regular as a default
    fontSize: 20,
    // fontWeight: "bold", // fontWeight is part of fontFamily now
    color: "#007AFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
