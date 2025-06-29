import React from 'react';
import { StyleSheet, View } from "react-native";
import { Card, Title, Text, Button, Chip, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";

export default function BookingItem({ booking, onCancel }) {
  // Format date
  const formattedDate = dayjs(booking.date).format("ddd, MMM D, YYYY");

  // Format time to AM/PM
  const formatTime = (time) => {
    if (!time) return "Invalid";
    const date = dayjs(`2000-01-01T${time}`);
    return date.isValid() ? date.format("hh:mm A") : "Invalid";
  };
  const formattedTime = `${formatTime(booking.start_time)} - ${formatTime(
    booking.end_time
  )}`;

  // Status UI styles
  const getStatusStyles = (status) => {
    switch (status) {
      case "confirmed":
        return {
          icon: "check-circle",
          color: "#4CAF50",
          bgColor: "#E8F5E9",
          text: "Confirmed",
        };
      case "cancelled":
        return {
          icon: "close-circle",
          color: "#F44336",
          bgColor: "#FFEBEE",
          text: "Cancelled",
        };
      case "pending":
      default:
        return {
          icon: "clock-outline",
          color: "#FFC107",
          bgColor: "#FFF8E1",
          text: "Pending",
        };
    }
  };

  const statusStyles = getStatusStyles(booking.status);

  const canBeCancelled =
    booking.status !== "cancelled" &&
    dayjs(booking.date).isAfter(dayjs(), "day");

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={styles.venueInfo}>
            <Title style={styles.venueTitle}>
              {booking.title || "Untitled Booking"}
            </Title>
            {/* If location is still needed, you can pass it separately */}
            <Text style={styles.locationText}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#666"
              />{" "}
              Some Location
            </Text>
          </View>
          <Chip
            icon={() => (
              <MaterialCommunityIcons
                name={statusStyles.icon}
                size={16}
                color={statusStyles.color}
              />
            )}
            style={[
              styles.statusChip,
              { backgroundColor: statusStyles.bgColor },
            ]}
            textStyle={{ color: statusStyles.color }}
          >
            {statusStyles.text}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{formattedTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>₹{booking.price}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mode:</Text>
            <Text style={styles.detailValue}>{booking.payment_mode}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    booking.payment_status === "completed"
                      ? "#4CAF50"
                      : booking.payment_status === "failed"
                      ? "#F44336"
                      : "#FFC107",
                },
              ]}
            >
              {booking.payment_status?.charAt(0).toUpperCase() +
                booking.payment_status?.slice(1)}
            </Text>
          </View>

          {booking.razorpay_payment_id && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Txn ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {booking.razorpay_payment_id}
              </Text>
            </View>
          )}

          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>

        {canBeCancelled && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            icon="close-circle"
          >
            Cancel Booking
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
    marginRight: 8,
  },
  venueTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  locationText: {
    color: "#666",
    fontSize: 14,
  },
  statusChip: {
    height: 32,
  },
  divider: {
    marginBottom: 12,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    width: 90,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontWeight: "500",
    color: "#333",
  },
  notesContainer: {
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#666",
  },
  notesText: {
    fontSize: 14,
    color: "#444",
  },
  cancelButton: {
    borderColor: "#F44336",
    marginTop: 8,
  },
});
