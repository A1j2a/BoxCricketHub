import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function SuccessScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>

          <Text style={styles.title}>Booking Successful!</Text>
          <Text style={styles.subtitle}>
            Your booking and payment were completed successfully.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("MyBookings")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            View My Bookings
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Home")}
            style={styles.outlineButton}
          >
            Back to Home
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    elevation: 5,
  },
  content: {
    alignItems: "center",
  },
  image: {
    height: 150,
    width: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
    width: "100%",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  outlineButton: {
    width: "100%",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
});
