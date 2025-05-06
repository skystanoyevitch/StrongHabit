import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { theme } from "../constants/theme"; // Import theme

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
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
    fontFamily: theme.fonts.titleBold, // Use Quicksand Bold for animated titles
    fontSize: 40,
    textAlign: "left",
    color: theme.colors.text, // Use theme text color
  },
});
