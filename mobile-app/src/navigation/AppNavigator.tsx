import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TodosScreen from '../screens/TodosScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Projects') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Todos') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Todos" component={TodosScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="ProjectDetail" 
            component={ProjectDetailScreen}
            options={{ headerShown: true, title: 'Project Details' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}