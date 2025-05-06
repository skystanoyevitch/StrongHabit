import { StyleSheet } from "react-native";
import { theme } from "../constants/theme"; // Import theme

export const sharedStyles = StyleSheet.create({
  welcomeText: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 24,
    color: theme.colors.text, // Use theme text color
    padding: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: theme.colors.primary, // Use theme primary color
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: theme.fonts.semibold, // Use Inter Semibold
    color: theme.colors.contrastPrimary, // Use contrast color for text on primary background
    fontSize: 16,
    // fontWeight: "600", // fontWeight is part of fontFamily now
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme background color
  },
});
