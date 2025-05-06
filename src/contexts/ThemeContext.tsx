import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme as PaperDarkTheme,
  MD3Colors, // Added MD3Colors import
} from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { MD3Theme } from "react-native-paper/lib/typescript/types";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  paperTheme: MD3Theme; // Use MD3Theme type
  navigationTheme: typeof NavigationDefaultTheme; // Keep this or adjust if needed
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Define the custom parts of the colors separately
const customDefaultColorsPart = {
  primary: "#0F4D92",
  background: "#FFFFFF", // Set to white
  surface: "#FFFFFF",
  error: "#FF3B30", // Map notification to error
  outline: "#e0e0e0", // Map border to outline
  onSurface: "#333333", // Map text to onSurface
  // backgroundGradient: ["#F0F8FF", "#FFF0F5"], // Removed
};

// Merge default themes with custom colors, ensuring MD3 structure
const CombinedDefaultTheme: MD3Theme = {
  ...MD3LightTheme, // Start with MD3 defaults
  colors: {
    ...MD3LightTheme.colors,
    ...customDefaultColorsPart, // Spread custom colors
  },
};

const customDarkColorsPart = {
  primary: "#4dabf7",
  background: "#121212", // Standard dark theme background
  surface: "#1e1e1e",
  error: "#FF456A", // Map notification to error
  outline: "#333333", // Map border to outline
  onSurface: "#e0e0e0", // Map text to onSurface
  // backgroundGradient: ["#000020", "#200020"], // Removed
};

const CombinedDarkTheme: MD3Theme = {
  ...PaperDarkTheme, // Start with MD3 dark defaults
  colors: {
    ...PaperDarkTheme.colors,
    ...customDarkColorsPart, // Spread custom colors
  },
};

const THEME_STORAGE_KEY = "@StrongHabit:themeMode";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const systemColorScheme = Appearance.getColorScheme();

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = (await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        )) as ThemeMode | null;
        if (storedMode) {
          setThemeModeState(storedMode);
        }
      } catch (e) {
        console.error("Failed to load theme mode from storage", e);
      }
    };
    loadThemeMode();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (e) {
      console.error("Failed to save theme mode to storage", e);
    }
  };

  const effectiveColorScheme = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme;
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Use the appropriate combined theme based on the effective color scheme
  // Explicitly cast to MD3Theme to satisfy the context and provider types
  const paperTheme: MD3Theme =
    effectiveColorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;

  // Adjust navigation theme based on the combined theme's colors
  // Map MD3 colors back to navigation theme properties
  const finalNavigationTheme =
    effectiveColorScheme === "dark"
      ? {
          ...NavigationDarkTheme,
          colors: {
            ...NavigationDarkTheme.colors,
            primary: CombinedDarkTheme.colors.primary,
            background: CombinedDarkTheme.colors.background, // Use theme background
            card: CombinedDarkTheme.colors.surface, // Map surface to card
            text: CombinedDarkTheme.colors.onSurface, // Map onSurface to text
            border: CombinedDarkTheme.colors.outline, // Map outline to border
            notification: CombinedDarkTheme.colors.error, // Map error to notification
          },
        }
      : {
          ...NavigationDefaultTheme,
          colors: {
            ...NavigationDefaultTheme.colors,
            primary: CombinedDefaultTheme.colors.primary,
            background: CombinedDefaultTheme.colors.background, // Use theme background
            card: CombinedDefaultTheme.colors.surface, // Map surface to card
            text: CombinedDefaultTheme.colors.onSurface, // Map onSurface to text
            border: CombinedDefaultTheme.colors.outline, // Map outline to border
            notification: CombinedDefaultTheme.colors.error, // Map error to notification
          },
        };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        paperTheme: paperTheme, // Pass the correctly typed theme
        navigationTheme: finalNavigationTheme,
      }}
    >
      {/* PaperProvider now receives a theme guaranteed to be MD3Theme */}
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
