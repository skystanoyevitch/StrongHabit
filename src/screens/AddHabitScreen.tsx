import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";

export default function AddHabitScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>AddHabitScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
