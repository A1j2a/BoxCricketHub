import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAllData, setUserAllData] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      const currentUser = data?.user;
      setUserAllData(currentUser);
      setUserData({
        name: currentUser?.user_metadata?.name || "",
        phone: currentUser?.user_metadata?.phone || "",
        email: currentUser?.email || "",
      });
    } catch (err) {
      console.error("Error fetching user :", err.message);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      });

      if (error) throw error;

      Alert.alert("Success", "Your profile has been updated.");
    } catch (err) {
      console.error("Error updating profile:", err.message);
      Alert.alert("Error", "Could not update your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Do you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          const result = await signOut();
          if (!result.success) {
            Alert.alert("Error", result.error || "Failed to logout.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Note: This needs service role access in Supabase!
              const { error } = await supabase.auth.admin.deleteUser(user.id);
              if (error) throw error;

              Alert.alert("Account Deleted", "Your account has been deleted.");
              await signOut();
            } catch (err) {
              console.error("Delete error:", err.message);
              Alert.alert("Error", "Failed to delete account.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user?.id]);

  if (loading && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "red" }}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchProfile}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View
            style={{ justifyContent: "space-between", flexDirection: "row" }}
          >
            <Title style={styles.title}>Your Profile</Title>
            <Text style={styles.title}>{userAllData?.user_metadata?.role}</Text>
          </View>

          <TextInput
            label="Name"
            mode="outlined"
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
            style={styles.input}
          />

          <TextInput
            label="Email"
            mode="outlined"
            value={userData.email}
            disabled
            style={styles.input}
          />

          <TextInput
            label="Phone"
            mode="outlined"
            keyboardType="phone-pad"
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            loading={loading}
            style={styles.button}
          >
            Update Profile
          </Button>

          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.button, styles.outlinedButton]}
            textColor="#1E88E5"
          >
            Logout
          </Button>

          <Button
            mode="contained"
            onPress={handleDeleteAccount}
            style={[styles.button, styles.deleteButton]}
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  card: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    borderRadius: 6,
  },
  outlinedButton: {
    borderColor: "#1E88E5",
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
