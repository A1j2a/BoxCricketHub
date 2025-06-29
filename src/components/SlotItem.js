import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Caption, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export default function SlotItem({ slot, onBook, onDelete, isAdmin = false }) {
  // Format time slot for display
const formatTimeSlot = (startTime, endTime) => {
  const start = dayjs(startTime, "HH:mm:ss").format("hh:mm A");
  const end = dayjs(endTime, "HH:mm:ss").format("hh:mm A");
  return `${start} - ${end}`;
};
  // Calculate duration in hours
  const calculateHours = () => {
    const start = dayjs(`2000-01-01 ${slot.start_time}`);
    const end = dayjs(`2000-01-01 ${slot.end_time}`);
    const duration = end.diff(start, 'hour', true);
    return duration.toFixed(1);
  };

  return (
    <Card 
      style={[
        styles.slotCard,
        slot.is_booked && styles.bookedSlotCard
      ]}
    >
      <Card.Content style={styles.slotCardContent}>
        <View>
          <Text style={styles.slotTime}>
            {formatTimeSlot(slot.start_time, slot.end_time)}
          </Text>
          <Caption>
            {slot.is_booked ? 'Already Booked' : 'Available'}
          </Caption>
          <Text style={styles.duration}>
            {calculateHours()} hour(s)
          </Text>
        </View>
        
        {isAdmin ? (
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => onDelete && onDelete(slot.id)}
            disabled={slot.is_booked}
            style={styles.deleteButton}
          >
            Delete
          </Button>
        ) : (
          <Button
            mode="contained"
            disabled={slot.is_booked}
            onPress={() => onBook && onBook(slot)}
            style={styles.bookButton}
          >
            Book
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  slotCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  bookedSlotCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  slotCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
    paddingHorizontal: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    borderColor: '#D32F2F',
  },
});
