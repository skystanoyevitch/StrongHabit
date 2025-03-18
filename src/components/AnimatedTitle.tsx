import React from "react";
import { Text, Animated, StyleSheet, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

interface AnimatedTitleProps {
  text: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
  const translateY = React.useRef(new Animated.Value(20)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        translateY.setValue(20);
        opacity.setValue(0);
      };
    }, [])
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <MaskedView maskElement={<Text style={styles.title}>{text}</Text>}>
        <LinearGradient
          colors={[
            "#1A2980", // Dark blue
            "#26D0CE", // Teal/greenish
          ]}
          // Optional: add more color stops for purple transition
          // colors={["#1A2980", "#4B3F72", "#26D0CE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </MaskedView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 42,
    padding: 10,
    textAlign: "center",
    lineHeight: 46, // Add line height for better spacing
    flexWrap: "wrap", // Enable text wrapping
  },
  gradient: {
    height: 60,
  },
});
