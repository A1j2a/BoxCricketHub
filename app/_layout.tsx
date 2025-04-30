// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { LogBox, Text, View } from "react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "../src/navigation/AppNavigator";
import { AuthProvider } from "../src/context/AuthContext";
export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#1E88E5", // Primary blue color
      accent: "#FFC107", // Accent yellow color
      background: "#F5F5F5",
      surface: "#FFFFFF",
      text: "#333333",
      error: "#D32F2F",
    },
  };
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "red" }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
