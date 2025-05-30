import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

// Custom cricket-themed light Paper theme
const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgb(27, 94, 32)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(76, 175, 80)",
    onPrimaryContainer: "rgb(255, 255, 255)",
    secondary: "rgb(255, 111, 0)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(255, 183, 77)",
    onSecondaryContainer: "rgb(255, 255, 255)",
    tertiary: "rgb(25, 118, 210)",
    background: "rgb(250, 250, 250)",
    surface: "rgb(255, 255, 255)",
    surfaceVariant: "rgb(245, 245, 245)",
    outline: "rgb(224, 224, 224)",
  },
};

// Custom cricket-themed dark Paper theme
const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "rgb(102, 187, 106)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(76, 175, 80)",
    onPrimaryContainer: "rgb(255, 255, 255)",
    secondary: "rgb(255, 143, 0)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(255, 183, 77)",
    onSecondaryContainer: "rgb(255, 255, 255)",
    tertiary: "rgb(66, 165, 245)",
    background: "rgb(18, 18, 18)",
    surface: "rgb(30, 30, 30)",
    surfaceVariant: "rgb(45, 45, 45)",
    outline: "rgb(51, 51, 51)",
  },
};

function AppContent() {
  const { isDarkMode } = useTheme(); // Your custom theme context hook
  const paperTheme = isDarkMode ? darkPaperTheme : lightPaperTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
