import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  welcomeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#2D3748",
    padding: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    // Add subtle shadow for depth
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
