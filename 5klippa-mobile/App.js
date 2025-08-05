// 5klippa-mobile/App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Button } from 'react-native';

function LoginScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Login Screen</Text>
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
      />
      <View style={styles.spacer} />
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Dashboard')}
      />
    </View>
  );
}

function RegisterScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Register Screen</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
      <View style={styles.spacer} />
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Dashboard')}
      />
    </View>
  );
}

function DashboardScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome to your Dashboard!</Text>
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate('Login')}
      />
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
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 18,
    marginBottom: 24,
  },
  spacer: {
    height: 12,
  },
});
