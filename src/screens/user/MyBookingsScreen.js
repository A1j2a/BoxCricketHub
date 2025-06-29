import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Title, 
  Card, 
  Button, 
  Chip, 
  Divider, 
  ActivityIndicator 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import BookingItem from '../../components/BookingItem';
import EmptyState from '../../components/EmptyState';
import ErrorComponent from '../../components/ErrorComponent';
import dayjs from 'dayjs';

export default function MyBookingsScreen({ navigation }) {
  const { user } = useAuth();
  
  // State variables
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:---", error.message);
      setError('Failed to load your bookings. Please try again.');
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
      .channel('bookings_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Refresh bookings when changes occur
        fetchBookings();
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);
  
  // Cancel a booking
  const handleCancelBooking = async (bookingId, slotId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Update booking status to 'cancelled'
              const { error: bookingError } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);
                
              if (bookingError) throw bookingError;
              
              // Update slot availability
              const { error: slotError } = await supabase
                .from('slots')
                .update({ is_booked: false })
                .eq('id', slotId);
                
              if (slotError) throw slotError;
              
              // Refresh bookings list
              await fetchBookings();
              
              Alert.alert('Success', 'Your booking has been cancelled successfully.');
            } catch (error) {
              console.error('Error cancelling booking:', error.message);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render loading state
  if (loading && !refreshing && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchBookings} />;
  }
  
  // Render empty state
  if (!loading && bookings.length === 0) {
    return (
      <EmptyState 
        icon="calendar-blank" 
        title="No Bookings Yet"
        message="You haven't made any bookings yet. Browse venues and book your next cricket session!"
        buttonText="Browse Venues"
        onButtonPress={() => navigation.navigate('HomeTab')}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <BookingItem 
            booking={item} 
            onCancel={() => handleCancelBooking(item.id, item.slot_id)} 
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E88E5']}
          />
        }
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  list: {
    padding: 16,
  },
  resultCount: {
    marginBottom: 12,
    fontSize: 14,
    color: '#666',
  },
});
