// app/index.js or app/index.tsx
import { Text, View } from "react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "../src/navigation/AppNavigator";
import { AuthProvider } from "../src/context/AuthContext";
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

export default function Index() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
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
