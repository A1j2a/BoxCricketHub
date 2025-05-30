import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  Dimensions, 
  TouchableOpacity,
  Linking,
  Platform
} from 'react-native';
import { 
  Text, 
  Title, 
  Caption, 
  Card, 
  Button, 
  Chip, 
  Divider, 
  ActivityIndicator 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import ErrorComponent from '../../components/ErrorComponent';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function VenueDetailScreen({ route, navigation }) {
  const { venueId } = route.params;
  const { user } = useAuth();
  
  // State variables
  const [venue, setVenue] = useState(null);
  const [owner, setOwner] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  
  // Fetch venue details and available slots
  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch venue details
      const { data: venueData, error: venueError } = await supabase
        .from('grounds')
        .select('*, users(*)')
        .eq('id', venueId)
        .single();
      
      if (venueError) throw venueError;
      
      setVenue(venueData);
      setOwner(venueData.users);
      
      // Fetch available slots for the selected date
      await fetchAvailableSlots(selectedDate);
      
    } catch (error) {
      console.error('Error fetching venue details:', error.message);
      setError('Failed to load venue details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available slots for a specific date
  const fetchAvailableSlots = async (date) => {
    try {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .eq('ground_id', venueId)
        .eq('date', date)
        .order('start_time');
        
      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error.message);
      // We'll just set available slots to empty array instead of showing an error
      setAvailableSlots([]);
    }
  };
  
  // Initial fetch of venue details
  useEffect(() => {
    fetchVenueDetails();
  }, [venueId]);
  
  // When selected date changes, fetch available slots
  useEffect(() => {
    if (venue) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);
  
  // Format time slot for display
  const formatTimeSlot = (startTime, endTime) => {
    const start = startTime.slice(0, 5); // HH:MM format
    const end = endTime.slice(0, 5);     // HH:MM format
    return `${start} - ${end}`;
  };
  
  // Navigate to booking screen
  const handleBookSlot = (slot) => {
    navigation.navigate('Booking', {
      venueId,
      venueName: venue?.name,
      slot,
      price: venue?.price_per_hour
    });
  };
  
  // Generate dates for the next 7 days
  const getNextSevenDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = dayjs().add(i, 'day');
      dates.push({
        date: date.format('YYYY-MM-DD'),
        display: i === 0 ? 'Today' : date.format('ddd, MMM D')
      });
    }
    return dates;
  };
  
  // Change selected date
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  // Open maps with the venue location
  const openMaps = () => {
    if (!venue?.location) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${venue.location}`,
      android: `geo:0,0?q=${venue.location}`
    });
    
    Linking.openURL(url);
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchVenueDetails} />;
  }
  
  // If venue not found
  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="cricket" size={64} color="#ccc" />
        <Text style={styles.errorText}>Venue not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Venue Image */}
      <Image
        source={{ uri: venue.image_url || 'https://via.placeholder.com/400x200?text=No+Image' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Venue Details */}
      <View style={styles.detailsContainer}>
        <Title style={styles.title}>{venue.name}</Title>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#555" />
          <Text 
            style={styles.infoText} 
            onPress={openMaps}
            numberOfLines={1}
          >
            {venue.location}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="currency-inr" size={20} color="#555" />
          <Text style={styles.infoText}>
            ₹{venue.price_per_hour} per hour
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="grass" size={20} color="#555" />
          <Text style={styles.infoText}>
            {venue.turf_type.charAt(0).toUpperCase() + venue.turf_type.slice(1)} turf
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={20} color="#555" />
          <Text style={styles.infoText}>
            Managed by {owner?.name || 'Unknown'}
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <Title style={styles.sectionTitle}>Description</Title>
        <Text style={styles.description}>
          {venue.description || 'No description available for this venue.'}
        </Text>
        
        <Divider style={styles.divider} />
        
        {/* Date Selection */}
        <Title style={styles.sectionTitle}>Available Slots</Title>
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
                selectedDate === date.date && styles.selectedDateChip
              ]}
              onPress={() => handleDateChange(date.date)}
            >
              <Text 
                style={[
                  styles.dateChipText,
                  selectedDate === date.date && styles.selectedDateChipText
                ]}
              >
                {date.display}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Available Slots */}
        <View style={styles.slotsContainer}>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <Card 
                key={slot.id} 
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
                  </View>
                  
                  <Button
                    mode="contained"
                    disabled={slot.is_booked}
                    onPress={() => handleBookSlot(slot)}
                    style={styles.bookButton}
                  >
                    Book
                  </Button>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.noSlotsContainer}>
              <MaterialCommunityIcons name="calendar-remove" size={48} color="#ccc" />
              <Text style={styles.noSlotsText}>
                No time slots available for this date
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#555',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
  },
  image: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  dateScrollView: {
    marginVertical: 16,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDateChip: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  dateChipText: {
    fontSize: 14,
    color: '#555',
  },
  selectedDateChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  slotsContainer: {
    marginBottom: 24,
  },
  slotCard: {
    marginBottom: 12,
    elevation: 2,
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
  bookButton: {
    paddingHorizontal: 12,
  },
  noSlotsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noSlotsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});
