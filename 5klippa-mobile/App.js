// 5klippa-mobile/App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder screens (we’ll replace LoginScreen soon)
function LoginScreen() {
  return (
    <View style={styles.center}>
      <Text>Login Screen</Text>
    </View>
  );
}

function RegisterScreen() {
  return (
    <View style={styles.center}>
      <Text>Register Screen</Text>
    </View>
  );
}

function DashboardScreen() {
  return (
    <View style={styles.center}>
      <Text>Welcome to your dashboard!</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
