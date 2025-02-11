import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";

const StatsScreen = () => {
  const nagivation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>StatsScreen</Text>
    </View>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
