import React from "react";
import { Text, StyleSheet, View } from "react-native";
import {
  useFonts,
  PermanentMarker_400Regular,
} from "@expo-google-fonts/permanent-marker";

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
  const [fontsLoaded] = useFonts({
    PermanentMarker_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    width: "100%",
  },
  title: {
    fontFamily: "PermanentMarker_400Regular",
    fontSize: 30,
    padding: 10,
    textAlign: "center",
    lineHeight: 40,
    flexWrap: "wrap",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    color: "#007AFF",
    maxWidth: "100%",
  },
});
