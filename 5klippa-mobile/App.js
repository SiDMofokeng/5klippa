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

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';


// Wrapper that renders a top banner and a white card for auth forms
function AuthWrapper({ children }) {
  return (
    <View style={styles.authWrapper}>
      {/* Top banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>5Klippa</Text>
        <Text style={styles.bannerSubtitle}>
          Financial Freedom Starts Here
        </Text>
      </View>
      {/* White card */}
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}


// ——————————————————————————————————————————————————————————
//   1) Login Screen
//
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

return (
  <AuthWrapper>
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

    {!!error && <Text style={styles.errorText}>{error}</Text>}

    <TouchableOpacity
      style={styles.button}
      onPress={handleLogin}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Logging in…' : 'Login'}
      </Text>
    </TouchableOpacity>

    <View style={{ height: 12 }} />

    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
      <Text style={styles.linkText}>New user? Register here</Text>
    </TouchableOpacity>
  </AuthWrapper>
);

}

//
// ——————————————————————————————————————————————————————————
//   2) Register Screen (placeholder)
function RegisterScreen({ navigation }) {
  const [email, setEmail]            = useState('');
  const [password, setPassword]      = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]              = useState('borrower');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState('');

  const handleRegister = async () => {
    // Clear previous errors
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create Auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2️⃣ Persist user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role,
      });

      // 3️⃣ Navigate to Dashboard
      navigation.replace('Dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

return (
  <AuthWrapper>
    <Text style={styles.header}>Create an Account</Text>

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

    <TextInput
      placeholder="Confirm Password"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry
      style={styles.input}
    />

    <Text style={styles.label}>Select Role</Text>
    <View style={styles.roleContainer}>
      <TouchableOpacity
        style={[
          styles.roleButton,
          role === 'borrower' && styles.roleSelected
        ]}
        onPress={() => setRole('borrower')}
      >
        <Text>Borrower</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.roleButton,
          role === 'lender' && styles.roleSelected
        ]}
        onPress={() => setRole('lender')}
      >
        <Text>Lender</Text>
      </TouchableOpacity>
    </View>

    {!!error && <Text style={styles.errorText}>{error}</Text>}

    <TouchableOpacity
      style={styles.button}
      onPress={handleRegister}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Creating…' : 'Register'}
      </Text>
    </TouchableOpacity>
  </AuthWrapper>
);

}


//
// ——————————————————————————————————————————————————————————
//   3) Dashboard Screen (placeholder)
function DashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);

  React.useEffect(() => {
    // Listen for auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch Firestore document
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } else {
        // If not logged in, send back to Login
        navigation.replace('Login');
      }
      setLoading(false);
    });

    // Cleanup listener
    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Welcome, {userData?.email || 'User'}!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        Role: {userData?.role}
      </Text>
      <Button
        title="Log Out"
        onPress={async () => {
          await auth.signOut();
          navigation.replace('Login');
        }}
      />
    </View>
  );
}


// Navigator setup
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard"component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 24,
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  spacer: {
    height: 12,
  },
  label: {
  fontSize: 14,
  marginBottom: 8,
  color: '#555',
},
roleContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 16,
},
roleButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
},
roleSelected: {
  backgroundColor: '#4A7CFF33',
  borderColor: '#4A7CFF',
},
authWrapper: {
  flex: 1,
  backgroundColor: '#4A7CFF',
  alignItems: 'center',
  paddingTop: 60,
},
banner: {
  alignItems: 'center',
  marginBottom: 20,
},
bannerTitle: {
  color: '#fff',
  fontSize: 28,
  fontWeight: 'bold',
},
bannerSubtitle: {
  color: '#fff',
  fontSize: 16,
  marginTop: 4,
},
card: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
},


});
