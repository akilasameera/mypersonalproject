import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AuthProvider from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}