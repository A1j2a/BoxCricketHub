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
  RadioButton,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function SignupScreen({ navigation }) {
  // State for form inputs and validation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get auth context
  const { signUp } = useAuth();
  console.log("role", role);

  // Validate form inputs
  const validateInputs = () => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSignupError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }

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

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const { success, error, message } = await signUp(
        email,
        password,
        name,
        role
      );

      if (!success) {
        if (error?.toLowerCase().includes("email")) {
          setEmailError("The provided email is invalid or already in use.");
        } else {
          setSignupError(error || "Signup failed. Please try again.");
        }
      } else {
        Alert.alert("Signup Successful", message || "Account created.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSignupError("An unexpected error occurred. Please try again.");
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
          <Title style={styles.title}>Create an Account</Title>
          <Text style={styles.subtitle}>Join BoxCricketHub today</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Signup error message */}
          {signupError ? (
            <HelperText
              type="error"
              visible={!!signupError}
              style={styles.errorText}
            >
              {signupError}
            </HelperText>
          ) : null}

          {/* Name input */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={!!nameError}
            left={<TextInput.Icon icon="account" />}
          />
          <HelperText type="error" visible={!!nameError}>
            {nameError}
          </HelperText>

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

          {/* Confirm Password input */}
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={secureConfirmTextEntry}
            style={styles.input}
            error={!!confirmPasswordError}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? "eye" : "eye-off"}
                onPress={() =>
                  setSecureConfirmTextEntry(!secureConfirmTextEntry)
                }
              />
            }
          />
          <HelperText type="error" visible={!!confirmPasswordError}>
            {confirmPasswordError}
          </HelperText>

          {/* Role selection */}
          <Text style={styles.roleTitle}>I am a:</Text>
          <View style={styles.roleContainer}>
            <View style={styles.roleOption}>
              <RadioButton
                value="user"
                status={role === "user" ? "checked" : "unchecked"}
                onPress={() => setRole("user")}
                color="#1E88E5"
              />
              <Text style={styles.roleText} onPress={() => setRole("user")}>
                Player/User
              </Text>
            </View>
            <View style={styles.roleOption}>
              <RadioButton
                value="admin"
                status={role === "admin" ? "checked" : "unchecked"}
                onPress={() => setRole("admin")}
                color="#1E88E5"
              />
              <Text style={styles.roleText} onPress={() => setRole("admin")}>
                Venue Owner
              </Text>
            </View>
          </View>

          {/* Signup button */}
          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Sign Up
          </Button>

          <Divider style={styles.divider} />

          {/* Login link */}
          <View style={styles.loginContainer}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Login</Text>
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
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  formContainer: {
    width: "100%",
    flex: 1,
  },
  input: {
    marginBottom: 5,
  },
  roleTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  roleText: {
    fontSize: 16,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
});
