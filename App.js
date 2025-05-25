// import React from "react";
// import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { NavigationContainer } from "@react-navigation/native";
// import AuthProvider from "./src/context/AuthProvider";
// import AppNavigator from "./src/navigation/AppNavigator";
// import { StatusBar } from "expo-status-bar";

// export default function App() {
//   const theme = {
//     ...DefaultTheme,
//     colors: {
//       ...DefaultTheme.colors,
//       primary: "#1E88E5", // Primary blue color
//       accent: "#FFC107", // Accent yellow color
//       background: "#F5F5F5",
//       surface: "#FFFFFF",
//       text: "#333333",
//       error: "#D32F2F",
//     },
//   };

//   return (
//     <SafeAreaProvider>
//       <PaperProvider theme={theme}>
//         <AuthProvider>
//           <NavigationContainer>
//             <StatusBar style="auto" />
//             <AppNavigator />
//           </NavigationContainer>
//         </AuthProvider>
//       </PaperProvider>
//     </SafeAreaProvider>
//   );
// }

import { View, Text } from "react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthProvider";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";

const App = () => {
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
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {/* <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider> */}
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
