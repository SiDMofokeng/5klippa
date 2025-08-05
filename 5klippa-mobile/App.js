// 5klippa-mobile/App.js
// 5klippa-mobile/App.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// 1️⃣ Ensure each screen is defined as a function component
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to MicroLend</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {/* we'll hook up auth next */}}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>New user? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}


function RegisterScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Register Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
      <View style={styles.spacer} />
      <Button title="Go to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </View>
  );
}

function DashboardScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome to your Dashboard!</Text>
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

// 2️⃣ Create the navigator
const Stack = createNativeStackNavigator();

// 3️⃣ Export the main App with NavigationContainer
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* name must match exactly and component must be in scope */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 4️⃣ Styles
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
  container: {
  flex: 1,
  backgroundColor: '#f8f8f8',
  padding: 20,
  justifyContent: 'center',
},
header: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 24,
  textAlign: 'center',
},
input: {
  height: 48,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginBottom: 16,
  backgroundColor: '#fff',
},
button: {
  height: 48,
  backgroundColor: '#4A7CFF',
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
linkText: {
  color: '#4A7CFF',
  fontSize: 14,
  textAlign: 'center',
},

});
