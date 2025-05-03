import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { useFonts } from "expo-font";

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
  },
  title: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 36,
    textAlign: "center",
    letterSpacing: 2,
    color: "#333333",
    textTransform: "uppercase",
  },
});
