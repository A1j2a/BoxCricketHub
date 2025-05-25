import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Text,
  Title,
  Divider,
  Chip,
  Button,
  ActivityIndicator,
  Searchbar,
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthProvider";
import EmptyState from "../../components/EmptyState";
import ErrorComponent from "../../components/ErrorComponent";
import dayjs from "dayjs";

export default function BookingsManagementScreen() {
  const { user } = useAuth();

  // State variables
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch bookings for grounds owned by the current user
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get all grounds owned by this admin
      const { data: grounds, error: groundsError } = await supabase
        .from("grounds")
        .select("id")
        .eq("owner_id", user.id);

      if (groundsError) throw groundsError;

      if (!grounds || grounds.length === 0) {
        setBookings([]);
        setFilteredBookings([]);
        return;
      }

      const groundIds = grounds.map((g) => g.id);

      // Get all slots for these grounds
      const { data: slots, error: slotsError } = await supabase
        .from("slots")
        .select("id, ground_id, date, start_time, end_time")
        .in("ground_id", groundIds);

      if (slotsError) throw slotsError;

      if (!slots || slots.length === 0) {
        setBookings([]);
        setFilteredBookings([]);
        return;
      }

      const slotIds = slots.map((s) => s.id);

      // Get all bookings for these slots including user info
      const { data: bookingData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          users:user_id(*),
          slots:slot_id(*, grounds:ground_id(*))
        `
        )
        .in("slot_id", slotIds)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings(bookingData || []);
      setFilteredBookings(bookingData || []);
    } catch (error) {
      console.error("Error fetching bookings: admin", error.message);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // Initial fetch of bookings
  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime changes for bookings
    const subscription = supabase
      .channel("admin_bookings_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          // We can't filter bookings directly by owner_id since it's related through grounds -> slots
        },
        (payload) => {
          // Refresh bookings when changes occur
          fetchBookings();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Apply search and filters
  useEffect(() => {
    if (bookings.length === 0) return;

    let results = [...bookings];

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((booking) => booking.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(
        (booking) =>
          booking.users?.name?.toLowerCase().includes(lowercasedQuery) ||
          booking.slots?.grounds?.name
            ?.toLowerCase()
            .includes(lowercasedQuery) ||
          booking.notes?.toLowerCase().includes(lowercasedQuery)
      );
    }

    setFilteredBookings(results);
  }, [bookings, statusFilter, searchQuery]);

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      // If cancelling, also update slot availability
      if (newStatus === "cancelled") {
        const booking = bookings.find((b) => b.id === bookingId);
        if (booking && booking.slot_id) {
          const { error: slotError } = await supabase
            .from("slots")
            .update({ is_booked: false })
            .eq("id", booking.slot_id);

          if (slotError) throw slotError;
        }
      }

      // Refresh bookings
      await fetchBookings();

      Alert.alert("Success", `Booking ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating booking status:", error.message);
      Alert.alert(
        "Error",
        "Failed to update booking status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle confirm booking
  const handleConfirmBooking = (bookingId) => {
    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to confirm this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => updateBookingStatus(bookingId, "confirmed"),
        },
      ]
    );
  };

  // Handle cancel booking
  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => updateBookingStatus(bookingId, "cancelled"),
        },
      ]
    );
  };

  // Render booking item
  const renderBookingItem = ({ item }) => {
    // Format date & time
    const date = dayjs(item.slots?.date).format("MMM D, YYYY");
    const startTime = item.slots?.start_time?.slice(0, 5) || "";
    const endTime = item.slots?.end_time?.slice(0, 5) || "";

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.venueName}>
            <MaterialCommunityIcons name="cricket" size={20} color="#1E88E5" />
            <Text style={styles.venueText}>
              {item.slots?.grounds?.name || "Unknown Venue"}
            </Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              item.status === "pending"
                ? styles.pendingChip
                : item.status === "confirmed"
                ? styles.confirmedChip
                : styles.cancelledChip,
            ]}
          >
            {item.status === "pending"
              ? "Pending"
              : item.status === "confirmed"
              ? "Confirmed"
              : "Cancelled"}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Player:</Text>
            <Text style={styles.detailValue}>
              {item.users?.name || "Unknown"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {date}, {startTime} - {endTime}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {item.status === "pending" && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              style={styles.confirmButton}
              onPress={() => handleConfirmBooking(item.id)}
            >
              Confirm
            </Button>
            <Button
              mode="outlined"
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              Cancel
            </Button>
          </View>
        )}

        {item.status === "confirmed" && (
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              Cancel Booking
            </Button>
          </View>
        )}
      </View>
    );
  };

  // Render loading state
  if (loading && !refreshing && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchBookings} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search bookings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {bookings.length === 0 ? (
        <EmptyState
          icon="calendar-blank"
          title="No Bookings Yet"
          message="You don't have any bookings yet. Once users book your venues, they will appear here."
          buttonText="Refresh"
          onButtonPress={onRefresh}
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon="calendar-search"
          title="No Matching Bookings"
          message="No bookings match your current filters. Try adjusting your search criteria."
          buttonText="Clear Filters"
          onButtonPress={() => {
            setStatusFilter("all");
            setSearchQuery("");
          }}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1E88E5"]}
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"} found
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  searchBar: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  resultCount: {
    marginBottom: 12,
    fontSize: 14,
    color: "#666",
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  venueName: {
    flexDirection: "row",
    alignItems: "center",
  },
  venueText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusChip: {
    height: 30,
  },
  pendingChip: {
    backgroundColor: "#FFF9C4",
  },
  confirmedChip: {
    backgroundColor: "#C8E6C9",
  },
  cancelledChip: {
    backgroundColor: "#FFCDD2",
  },
  divider: {
    marginBottom: 12,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontWeight: "500",
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});
