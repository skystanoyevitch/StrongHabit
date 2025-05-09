import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { getAccessibilityProps } from "../../utils/accessibilityUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Key to check if onboarding has been completed
const ONBOARDING_COMPLETED_KEY = "@onboarding_completed";

// Define types for onboarding data
interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  icon: any; // Using any type to accommodate MaterialCommunityIcons names
}

// Onboarding content
const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to StrongHabit",
    description:
      "Create and track habits that help you grow stronger every day.",
    backgroundColor: "#3498db",
    icon: "home",
  },
  {
    id: "2",
    title: "Track Your Progress",
    description:
      "View your streaks, statistics and achievements to stay motivated.",
    backgroundColor: "#2ecc71",
    icon: "chart-line",
  },
  {
    id: "3",
    title: "Daily Reminders",
    description: "Set reminders to make sure you never miss a habit.",
    backgroundColor: "#e74c3c",
    icon: "bell",
  },
  {
    id: "4",
    title: "Ready to Start?",
    description: "Start building new habits today.",
    backgroundColor: "#9b59b6",
    icon: "rocket",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);
  const { width } = useWindowDimensions();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    onComplete();
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    onComplete();
  };

  // Check viewable items change
  const handleViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  // Render onboarding item
  const renderItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    return (
      <View
        style={[styles.slide, { width, backgroundColor: item.backgroundColor }]}
      >
        <View style={styles.slideContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={item.icon} size={80} color="white" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  // Render dot indicators
  const renderDotIndicators = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex ? styles.activeDot : {}]}
            {...getAccessibilityProps(
              `Page ${index + 1} of ${onboardingData.length}`,
              undefined,
              "none"
            )}
          />
        ))}
      </View>
    );
  };

  // Render the appropriate button (next or get started)
  const renderButton = () => {
    if (currentIndex === onboardingData.length - 1) {
      return (
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          {...getAccessibilityProps(
            "Get Started",
            "Double tap to start using the app",
            "button"
          )}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          {...getAccessibilityProps(
            "Skip onboarding",
            "Double tap to skip onboarding",
            "button"
          )}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          {...getAccessibilityProps(
            "Next page",
            "Double tap to go to the next page",
            "button"
          )}
        >
          <Text style={styles.nextText}>Next</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEnabled={true}
        keyExtractor={(item) => item.id}
      />
      {renderDotIndicators()}
      {renderButton()}
    </SafeAreaView>
  );
}

/**
 * Helper function to check if the user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: theme.fonts.regular,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    fontSize: 18,
    color: "#333",
    fontFamily: theme.fonts.medium,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  nextText: {
    color: "white",
    fontSize: 18,
    marginRight: 5,
    fontFamily: theme.fonts.medium,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 30,
    alignItems: "center",
  },
  getStartedText: {
    color: "white",
    fontSize: 20,
    fontFamily: theme.fonts.semibold,
  },
});
