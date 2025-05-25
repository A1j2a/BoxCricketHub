import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  Text,
  Title,
  TextInput,
  Button,
  Card,
  Divider,
  Surface,
  HelperText,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthProvider";
import dayjs from "dayjs";

export default function BookingScreen({ route, navigation }) {
  if (!slot || !venueId || !price) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Missing booking data. Please go back and try again.</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }
  const { venueId, venueName, slot, price } = route.params;
  const { user } = useAuth();

  // State variables
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format date and time for display
  const formattedDate = dayjs(slot.date).format("ddd, MMM D, YYYY");
  const formattedTime = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(
    0,
    5
  )}`;

  // Calculate time difference in hours
  const calculateHours = () => {
    const start = dayjs(`2000-01-01 ${slot.start_time}`);
    const end = dayjs(`2000-01-01 ${slot.end_time}`);
    const duration = end.diff(start, "hour", true);
    return duration;
  };

  // Calculate total price
  const hours = calculateHours();
  const totalPrice = price * hours;

  // Handle booking submission
  const handleBooking = async () => {
    try {
      setLoading(true);
      setError("");

      // Check if slot is already booked
      const { data: checkData, error: checkError } = await supabase
        .from("slots")
        .select("is_booked")
        .eq("id", slot.id)
        .single();

      if (checkError) throw checkError;

      if (checkData.is_booked) {
        Alert.alert(
          "Slot Unavailable",
          "Sorry, this slot has just been booked by someone else. Please try another slot.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }

      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            slot_id: slot.id,
            user_id: user.id,
            status: "pending",
            notes: notes.trim() || null,
          },
        ])
        .select();

      if (bookingError) throw bookingError;

      // Update slot status to booked
      const { error: updateError } = await supabase
        .from("slots")
        .update({ is_booked: true })
        .eq("id", slot.id);

      if (updateError) throw updateError;

      // Show success message and navigate back
      Alert.alert(
        "Booking Successful",
        "Your booking request has been sent successfully. You can view its status in My Bookings.",
        [
          {
            text: "View My Bookings",
            onPress: () => navigation.navigate("MyBookings"),
          },
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      console.error("Error making booking:", error.message);
      setError("Failed to make booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Booking Confirmation</Title>

            <View style={styles.venueInfoContainer}>
              <MaterialCommunityIcons
                name="cricket"
                size={24}
                color="#1E88E5"
              />
              <Text style={styles.venueName}>{venueName}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.bookingDetailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{formattedTime}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{hours} hour(s)</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rate:</Text>
                <Text style={styles.detailValue}>₹{price} per hour</Text>
              </View>
            </View>

            <Surface style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
            </Surface>

            <TextInput
              label="Additional Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              mode="outlined"
              style={styles.notesInput}
              placeholder="Any special requests or information for the venue owner"
            />

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleBooking}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
              contentStyle={styles.buttonContent}
            >
              Confirm Booking
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </Card.Content>
        </Card>
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
    padding: 16,
    flexGrow: 1,
  },
  card: {
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  venueInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  divider: {
    marginBottom: 16,
  },
  bookingDetailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#555",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  notesInput: {
    marginBottom: 24,
  },
  confirmButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
