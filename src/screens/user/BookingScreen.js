import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import {
  Text,
  Title,
  TextInput,
  Button,
  Card,
  Divider,
  Surface,
  HelperText,
  RadioButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import RazorpayService from "../../services/RazorpayService";

export default function BookingScreen({ route, navigation }) {
  const { venueId, venueName, slot, price } = route.params;
  const { user } = useAuth();

  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = dayjs(slot.date).format("ddd, MMM D, YYYY");
  const formattedTime = `${dayjs(slot.start_time, "HH:mm:ss").format(
    "hh:mm A"
  )} - ${dayjs(slot.end_time, "HH:mm:ss").format("hh:mm A")}`;

  const calculateHours = () => {
    const start = dayjs(slot.start_time);
    const end = dayjs(slot.end_time);
    return end.diff(start, "hour", true);
  };

  const hours = calculateHours();
  const totalPrice = price * hours;
  console.log(price, hours, totalPrice);

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
          "Sorry, this slot has just been booked by someone else.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }

      let paymentStatus = "pending";
      let paymentId = null;

      if (paymentMode === "online") {
        const paymentResult = await RazorpayService.initiateBookingPayment({
          amount: totalPrice,
          venueName,
          userName: user.user_metadata?.name || "",
          userEmail: user.email,
          userPhone: user.user_metadata?.phone || "",
          slotId: slot.id,
        });

        if (!paymentResult.success) {
          Alert.alert("Payment Failed", paymentResult.error || "Try again.");
          return;
        }

        paymentStatus = "completed";
        paymentId = paymentResult.paymentId;
      }

      const formatTimeOnly = (datetimeString) => {
        return dayjs(datetimeString).format("HH:mm:ss"); // or 'HH:mm' if seconds not needed
      };

      const payload = {
        title: `Booking for ${venueName}`,
        slot_id: slot.id,
        user_id: user.id,
        status: "pending",
        start_time: formatTimeOnly(slot.start_time),
        end_time: formatTimeOnly(slot.end_time),
        date: dayjs(slot.date).format("YYYY-MM-DD"),
        price: totalPrice,
        notes: notes.trim() || null,
        payment_mode: paymentMode,
        payment_status: paymentStatus,
        razorpay_payment_id: paymentId || null,
      };

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([payload])
        .select();

      if (bookingError) throw bookingError;

      const { error: updateError } = await supabase
        .from("slots")
        .update({ is_booked: true })
        .eq("id", slot.id);

      if (updateError) throw updateError;

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }], // Or show Alert like before
      });
    } catch (error) {
      console.error("Error making booking:", error.message);
      setError("Booking failed. Please try again.");
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

            <Text style={styles.paymentModeLabel}>Select Payment Mode:</Text>
            <RadioButton.Group
              onValueChange={setPaymentMode}
              value={paymentMode}
            >
              <View style={styles.paymentOptions}>
                <View style={styles.radioOption}>
                  <RadioButton value="online" />
                  <Text>Online</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="offline" />
                  <Text>Offline</Text>
                </View>
              </View>
            </RadioButton.Group>

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
  paymentModeLabel: {
    marginBottom: 8,
    fontWeight: "500",
    fontSize: 16,
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
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
