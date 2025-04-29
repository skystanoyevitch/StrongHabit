import React from "react";
import { Text, StyleSheet, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <MaskedView maskElement={<Text style={styles.title}>{text}</Text>}>
        <LinearGradient
          colors={[
            "#007AFF", // iOS blue
            "#00B4DB", // Light blue
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 36,
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
