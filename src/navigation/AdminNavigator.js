import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GroundsListScreen from '../screens/admin/GroundsListScreen';
import AddEditGroundScreen from '../screens/admin/AddEditGroundScreen';
import SlotsManagementScreen from '../screens/admin/SlotsManagementScreen';
import BookingsManagementScreen from '../screens/admin/BookingsManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for the grounds management
function GroundsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E88E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="GroundsList" 
        component={GroundsListScreen} 
        options={{ title: 'My Grounds' }} 
      />
      <Stack.Screen 
        name="AddEditGround" 
        component={AddEditGroundScreen}
        options={({ route }) => ({ 
          title: route.params?.groundId ? 'Edit Ground' : 'Add New Ground' 
        })}
      />
      <Stack.Screen 
        name="SlotsManagement" 
        component={SlotsManagementScreen}
        options={({ route }) => ({ 
          title: `Manage Slots: ${route.params?.groundName || ''}` 
        })}
      />
    </Stack.Navigator>
  );
}

// Main tab navigator for admin
export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="GroundsTab"
        component={GroundsStack}
        options={{
          tabBarLabel: 'My Grounds',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cricket" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsManagementScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'Booking Requests'
        }}
      />
    </Tab.Navigator>
  );
}
