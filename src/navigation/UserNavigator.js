import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "../screens/user/HomeScreen";
import VenueDetailScreen from "../screens/user/VenueDetailScreen";
import BookingScreen from "../screens/user/BookingScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PrivacyPolicyScreen from "../screens/profile/PrivacyPolicyScreen"; // ✅ import
import MediaViewerScreen from "../components/MediaViewerScreen";
import SuccessScreen from "../screens/admin/SuccessScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ Stack navigator for the Home tab
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E88E5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Cricket Venues", headerShown: false }}
      />
      <Stack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={({ route }) => ({
          title: route.params?.venueName || "Venue Details",
          headerShown: route.params?.venueName ? false : true,
        })}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Book Venue" }}
      />
      <Stack.Screen
        name="MediaViewerScreen"
        component={MediaViewerScreen}
        options={{ title: "Book Venue", headerShown: false }}
      />
      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ✅ Stack navigator for the Profile tab
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E88E5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }}
      />
    </Stack.Navigator>
  );
}

// ✅ Main bottom tab navigator
export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false, // tabs hide headers, stacks handle them
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Venues",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cricket" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: "My Bookings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-check"
              color={color}
              size={size}
            />
          ),
          headerShown: true,
          headerStyle: { backgroundColor: "#1E88E5" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack} // ✅ Use stack here
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
