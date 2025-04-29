import React from "react";
import { Text, StyleSheet, View, Dimensions } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
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
      <MaskedView maskElement={<Text style={styles.title}>{text}</Text>}>
        <LinearGradient
          colors={[
            "#007AFF", // iOS blue
            "#FF6B00", // Vibrant orange
            "#007AFF", // iOS blue
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </MaskedView>
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
    fontSize: 25,
    padding: 10,
    textAlign: "center",
    lineHeight: 40,
    flexWrap: "wrap",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradient: {
    height: 50,
  },
});
