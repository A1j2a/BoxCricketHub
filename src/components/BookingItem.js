import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { Card, Title, Text, Button, Chip, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export default function BookingItem({ booking, onCancel }) {
  // Access nested data safely
  const venue = booking?.slots?.grounds || {};
  const slot = booking?.slots || {};
  
  // Format date
  const formattedDate = dayjs(slot.date).format('ddd, MMM D, YYYY');
  
  // Format time
  const formatTime = (time) => {
    return time ? time.slice(0, 5) : ''; // HH:MM format
  };
  
  // Get status color and icon
  const getStatusStyles = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          text: 'Confirmed'
        };
      case 'cancelled':
        return {
          icon: 'close-circle',
          color: '#F44336',
          bgColor: '#FFEBEE',
          text: 'Cancelled'
        };
      case 'pending':
      default:
        return {
          icon: 'clock-outline',
          color: '#FFC107',
          bgColor: '#FFF8E1',
          text: 'Pending'
        };
    }
  };
  
  const statusStyles = getStatusStyles(booking.status);
  
  // Check if booking can be cancelled
  const canBeCancelled = booking.status !== 'cancelled' && dayjs(slot.date).isAfter(dayjs(), 'day');
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={styles.venueInfo}>
            <Title style={styles.venueTitle}>{venue.name || 'Unknown Venue'}</Title>
            <Text style={styles.locationText} numberOfLines={1}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
              {' ' + (venue.location || 'Unknown location')}
            </Text>
          </View>
          <Chip 
            icon={() => <MaterialCommunityIcons name={statusStyles.icon} size={16} color={statusStyles.color} />}
            style={[styles.statusChip, { backgroundColor: statusStyles.bgColor }]}
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
            <Text style={styles.detailValue}>
              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>
              ₹{venue.price_per_hour || '0'} per hour
            </Text>
          </View>
          
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    color: '#666',
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
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 60,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#444',
  },
  cancelButton: {
    borderColor: '#F44336',
    marginTop: 8,
  }
});
