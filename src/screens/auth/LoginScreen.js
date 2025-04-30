import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  HelperText,
  Divider,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen({ navigation }) {
  // State for form inputs and validation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get auth context
  const { signIn } = useAuth();

  // Validate form inputs
  const validateInputs = () => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setLoginError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const { success, error } = await signIn(email, password);

      if (!success) {
        setLoginError(error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          {/* SVG Logo */}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/1099/1099680.png",
            }}
            style={styles.logo}
          />
          <Title style={styles.title}>BoxCricketHub</Title>
          <Text style={styles.subtitle}>Book your favorite cricket venues</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Login error message */}
          {loginError ? (
            <HelperText
              type="error"
              visible={!!loginError}
              style={styles.errorText}
            >
              {loginError}
            </HelperText>
          ) : null}

          {/* Email input */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!emailError}
            left={<TextInput.Icon icon="email" />}
          />
          <HelperText type="error" visible={!!emailError}>
            {emailError}
          </HelperText>

          {/* Password input */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            error={!!passwordError}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          {/* Login button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Login
          </Button>

          <Divider style={styles.divider} />

          {/* Sign up link */}
          <View style={styles.signupContainer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  divider: {
    marginVertical: 24,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
});
