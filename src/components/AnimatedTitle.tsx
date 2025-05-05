import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
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
    fontFamily: "Poppins_600SemiBold",
    fontSize: 32,
    textAlign: "center",
    color: "#333333",
  },
});
