import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading, userProfile, isAdmin } = useAuth();

  // Show loading screen while checking authentication status
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // If user is authenticated, check role and show appropriate navigator
        isAdmin ? (
          <Stack.Screen name="AdminRoot" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="UserRoot" component={UserNavigator} />
        )
      ) : (
        // If not authenticated, show auth screens
        <Stack.Screen name="AuthRoot" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
