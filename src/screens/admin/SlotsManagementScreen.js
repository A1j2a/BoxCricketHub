import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  Title,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  DataTable,
  FAB,
  Dialog,
  Portal,
  TextInput,
  HelperText,
  List,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthProvider";
import ErrorComponent from "../../components/ErrorComponent";
import EmptyState from "../../components/EmptyState";
import dayjs from "dayjs";

export default function SlotsManagementScreen({ route, navigation }) {
  const { groundId, groundName } = route.params;
  const { user } = useAuth();

  // State variables
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  // Dialog state for adding new slots
  const [dialogVisible, setDialogVisible] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timeError, setTimeError] = useState("");

  // Fetch slots for the selected date
  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("slots")
        .select("*, bookings(*)")
        .eq("ground_id", groundId)
        .eq("date", selectedDate)
        .order("start_time");

      if (error) throw error;

      setSlots(data || []);
    } catch (error) {
      console.error("Error fetching slots:", error.message);
      setError("Failed to load slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of slots
  useEffect(() => {
    fetchSlots();

    // Subscribe to realtime changes for slots
    const subscription = supabase
      .channel("slots_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "slots",
          filter: `ground_id=eq.${groundId}`,
        },
        (payload) => {
          // Only refresh if the change affects the current selected date
          if (payload.new && payload.new.date === selectedDate) {
            fetchSlots();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [groundId, selectedDate]);

  // Generate dates for the next 7 days
  const getNextSevenDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = dayjs().add(i, "day");
      dates.push({
        date: date.format("YYYY-MM-DD"),
        display: i === 0 ? "Today" : date.format("ddd, MMM D"),
      });
    }
    return dates;
  };

  // Change selected date
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle dialog open/close
  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => {
    setDialogVisible(false);
    setStartTime("");
    setEndTime("");
    setTimeError("");
  };

  // Validate time inputs
  const validateTimeInputs = () => {
    setTimeError("");

    if (!startTime || !endTime) {
      setTimeError("Both start time and end time are required");
      return false;
    }

    const start = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);

    if (!start.isValid() || !end.isValid()) {
      setTimeError("Please enter valid times in HH:MM format");
      return false;
    }

    if (end.isBefore(start) || end.isSame(start)) {
      setTimeError("End time must be after start time");
      return false;
    }

    // Check for overlapping with existing slots
    for (const slot of slots) {
      const existingStart = dayjs(`2000-01-01 ${slot.start_time}`);
      const existingEnd = dayjs(`2000-01-01 ${slot.end_time}`);

      if (
        (start.isAfter(existingStart) && start.isBefore(existingEnd)) ||
        (end.isAfter(existingStart) && end.isBefore(existingEnd)) ||
        start.isSame(existingStart) ||
        end.isSame(existingEnd) ||
        (start.isBefore(existingStart) && end.isAfter(existingEnd))
      ) {
        setTimeError("This time slot overlaps with an existing slot");
        return false;
      }
    }

    return true;
  };

  const formatToTimestamp = (date, hour) => {
    const paddedHour = hour.toString().padStart(2, "0");
    return `${date}T${paddedHour}:00:00`; // Format: YYYY-MM-DDTHH:MM:SS
  };

  const addSlot = async () => {
    if (!validateTimeInputs()) return;

    try {
      setLoading(true);

      const formattedStart = formatToTimestamp(selectedDate, startTime);
      const formattedEnd = formatToTimestamp(selectedDate, endTime);

      console.log("Adding slot:", {
        ground_id: groundId,
        date: selectedDate,
        start_time: formattedStart,
        end_time: formattedEnd,
        is_booked: false,
      });

      const { data, error } = await supabase.from("slots").insert([
        {
          ground_id: groundId,
          date: selectedDate, // keep date as YYYY-MM-DD
          start_time: formattedStart, // now full ISO string
          end_time: formattedEnd,
          is_booked: false,
        },
      ]);

      if (error) throw error;

      await fetchSlots();
      hideDialog();
    } catch (error) {
      console.error("Error adding slot:", error.message);
      Alert.alert("Error", "Failed to add slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a slot
  const deleteSlot = async (slotId, hasBookings) => {
    // If slot has bookings, show warning
    if (hasBookings) {
      Alert.alert(
        "Cannot Delete",
        "This slot has bookings. Cancel all bookings first.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Slot",
      "Are you sure you want to delete this time slot?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const { error } = await supabase
                .from("slots")
                .delete()
                .eq("id", slotId);

              if (error) throw error;

              await fetchSlots();
              Alert.alert("Success", "Slot deleted successfully");
            } catch (error) {
              console.error("Error deleting slot:", error.message);
              Alert.alert("Error", "Failed to delete slot. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Format time for display
  const formatTime = (time) => {
    return time.slice(0, 5); // HH:MM format
  };

  // Render loading state
  if (loading && slots.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading slots...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchSlots} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Title style={styles.title}>Time Slots for {groundName}</Title>

          {/* Date Selection */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScrollView}
          >
            {getNextSevenDays().map((date) => (
              <TouchableOpacity
                key={date.date}
                style={[
                  styles.dateChip,
                  selectedDate === date.date && styles.selectedDateChip,
                ]}
                onPress={() => handleDateChange(date.date)}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    selectedDate === date.date && styles.selectedDateChipText,
                  ]}
                >
                  {date.display}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {slots.length === 0 ? (
          <EmptyState
            icon="calendar-clock"
            title="No Slots Added"
            message={`You haven't added any time slots for ${dayjs(
              selectedDate
            ).format("MMM D, YYYY")} yet.`}
            buttonText="Add Time Slot"
            onButtonPress={showDialog}
          />
        ) : (
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title>Time Slot</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title numeric>Actions</DataTable.Title>
            </DataTable.Header>

            {slots.map((slot) => {
              const hasBookings = slot.bookings && slot.bookings.length > 0;

              return (
                <DataTable.Row key={slot.id}>
                  <DataTable.Cell>
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      style={{
                        backgroundColor: slot.is_booked ? "#ffebee" : "#e8f5e9",
                        borderColor: slot.is_booked ? "#ef5350" : "#66bb6a",
                      }}
                      textStyle={{
                        color: slot.is_booked ? "#d32f2f" : "#2e7d32",
                      }}
                    >
                      {slot.is_booked ? "Booked" : "Available"}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <IconButton
                      icon="delete"
                      color="#D32F2F"
                      size={20}
                      onPress={() => deleteSlot(slot.id, hasBookings)}
                      disabled={slot.is_booked}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showDialog}
        disabled={loading}
      />

      {/* Add Slot Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Add New Time Slot</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDate}>
              Date: {dayjs(selectedDate).format("MMM D, YYYY")}
            </Text>

            <TextInput
              label="Start Time (HH:MM)"
              value={startTime}
              onChangeText={setStartTime}
              mode="outlined"
              placeholder="e.g. 14:00"
              style={styles.dialogInput}
              keyboardType="numbers-and-punctuation"
            />

            <TextInput
              label="End Time (HH:MM)"
              value={endTime}
              onChangeText={setEndTime}
              mode="outlined"
              placeholder="e.g. 16:00"
              style={styles.dialogInput}
              keyboardType="numbers-and-punctuation"
            />

            {timeError ? (
              <HelperText type="error" visible={!!timeError}>
                {timeError}
              </HelperText>
            ) : null}

            <Text style={styles.timeFormatHelp}>
              Use 24-hour format (e.g. 14:00 for 2 PM)
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={addSlot} disabled={loading}>
              {loading ? "Adding..." : "Add Slot"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
  dateScrollView: {
    marginBottom: 16,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedDateChip: {
    backgroundColor: "#1E88E5",
    borderColor: "#1E88E5",
  },
  dateChipText: {
    fontSize: 14,
    color: "#555",
  },
  selectedDateChipText: {
    color: "#fff",
    fontWeight: "bold",
  },
  table: {
    paddingHorizontal: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#1E88E5",
  },
  dialogDate: {
    marginBottom: 16,
    fontSize: 16,
  },
  dialogInput: {
    marginBottom: 12,
  },
  timeFormatHelp: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});
