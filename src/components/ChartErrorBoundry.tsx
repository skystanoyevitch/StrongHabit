// src/components/ChartErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  fallbackHeight?: number;
}

interface State {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View
          style={[
            styles.container,
            { height: this.props.fallbackHeight || 220 },
          ]}
        >
          <Text style={styles.text}>Chart could not be displayed</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  text: {
    color: "#666",
    fontSize: 14,
  },
});

export default ChartErrorBoundary;
