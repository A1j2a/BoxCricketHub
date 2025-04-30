import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "../screens/user/HomeScreen";
import VenueDetailScreen from "../screens/user/VenueDetailScreen";
import BookingScreen from "../screens/user/BookingScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for the home tab (venues and booking flow)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1E88E5",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Cricket Venues" }}
      />
      <Stack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={({ route }) => ({
          title: route.params?.venueName || "Venue Details",
        })}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Book Venue" }}
      />
    </Stack.Navigator>
  );
}

// Main tab navigator for user
export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
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
          headerStyle: {
            backgroundColor: "#1E88E5",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Tab.Navigator>
  );
}
