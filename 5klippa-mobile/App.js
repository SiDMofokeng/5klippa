// 5klippa-mobile/App.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

import theme from './theme';

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

        {userData?.role === 'borrower' && (
          <TouchableOpacity
            style={[styles.button, { marginTop: theme.spacing.small }]}
            onPress={() => navigation.navigate('BorrowerDashboard')}
          >
            <Text style={styles.buttonText}>Borrower Dashboard</Text>
          </TouchableOpacity>
        )}

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

function BorrowerDashboardScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Borrower Dashboard</Text>
      <Text>Your loan applications and status will appear here.</Text>

      {/* New Loan button moved here */}
      <TouchableOpacity
        style={[styles.button, { marginTop: theme.spacing.medium }]}
        onPress={() => navigation.navigate('NewLoan')}
      >
        <Text style={styles.buttonText}>New Loan</Text>
      </TouchableOpacity>
    </View>
  );
}


function NewLoanScreen({ navigation }) {
  const [amount, setAmount]     = useState('');
  const [term, setTerm]         = useState('');
  const [purpose, setPurpose]   = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>New Loan Application</Text>

      <TextInput
        placeholder="Amount (e.g. 5000)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Term (months)"
        value={term}
        onChangeText={setTerm}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Purpose"
        value={purpose}
        onChangeText={setPurpose}
        multiline
        numberOfLines={3}
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          /* logic to save loan will go here */
          navigation.goBack();
        }}
      >
        <Text style={styles.buttonText}>Submit Application</Text>
      </TouchableOpacity>
    </ScrollView>
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
        <Stack.Screen name="BorrowerDashboard" component={BorrowerDashboardScreen} />
        <Stack.Screen name="NewLoan"           component={NewLoanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  authWrapper: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingTop: theme.spacing.large,
  },
  banner: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  bannerTitle: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.body,
    marginTop: theme.spacing.xsmall,
  },
  card: {
    width: '90%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.large,
    padding: theme.spacing.medium,
    ...theme.shadows.default,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    justifyContent: 'center',
  },
  header: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.h2,
    fontWeight: 'bold',
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.medium,
    paddingHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
    backgroundColor: theme.colors.cardBackground,
    color: theme.colors.text,
  },
  button: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.small,
  },
  buttonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.body,
    fontWeight: '600',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
    marginTop: theme.spacing.xsmall,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.xsmall,
    color: theme.colors.textMuted,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.small,
  },
  roleButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.medium,
  },
  roleSelected: {
    backgroundColor: theme.colors.primary + '33',
    borderColor: theme.colors.primary,
  },
  spacer: {
    height: theme.spacing.small,
  },
    center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.h2,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
  },
});
