import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function useBookings(isAdmin = false) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to refresh bookings
  const refreshBookings = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) return;
        
        if (isAdmin) {
          // Admin sees bookings for their grounds
          // First get all grounds owned by this admin
          const { data: grounds, error: groundsError } = await supabase
            .from('grounds')
            .select('id')
            .eq('owner_id', user.id);
            
          if (groundsError) throw groundsError;
          
          if (!grounds || grounds.length === 0) {
            setBookings([]);
            return;
          }
          
          const groundIds = grounds.map(g => g.id);
          
          // Get all slots for these grounds
          const { data: slots, error: slotsError } = await supabase
            .from('slots')
            .select('id')
            .in('ground_id', groundIds);
            
          if (slotsError) throw slotsError;
          
          if (!slots || slots.length === 0) {
            setBookings([]);
            return;
          }
          
          const slotIds = slots.map(s => s.id);
          
          // Get all bookings for these slots
          const { data: bookingData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              *,
              users:user_id(*),
              slots:slot_id(*, grounds:ground_id(*))
            `)
            .in('slot_id', slotIds)
            .order('created_at', { ascending: false });
            
          if (bookingsError) throw bookingsError;
          
          setBookings(bookingData || []);
        } else {
          // Regular user sees their own bookings
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              slots(*, grounds(*))
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          setBookings(data || []);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error.message);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        ...(isAdmin ? {} : { filter: `user_id=eq.${user?.id}` })
      }, () => {
        fetchBookings();
      })
      .subscribe();
      
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, isAdmin, refreshTrigger]);
  
  // Create a new booking
  const createBooking = async (slotId, notes = '') => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Check if slot is already booked
      const { data: slotData, error: slotError } = await supabase
        .from('slots')
        .select('is_booked')
        .eq('id', slotId)
        .single();
        
      if (slotError) throw slotError;
      
      if (slotData.is_booked) {
        throw new Error('This slot is already booked');
      }
      
      // Create booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            slot_id: slotId,
            user_id: user.id,
            status: 'pending',
            notes: notes.trim() || null
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Update slot status
      const { error: updateError } = await supabase
        .from('slots')
        .update({ is_booked: true })
        .eq('id', slotId);
        
      if (updateError) throw updateError;
      
      refreshBookings();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error creating booking:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Update booking status
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select();
        
      if (error) throw error;
      
      // If cancelling, free up the slot
      if (status === 'cancelled') {
        const bookingData = data[0];
        
        const { error: slotError } = await supabase
          .from('slots')
          .update({ is_booked: false })
          .eq('id', bookingData.slot_id);
          
        if (slotError) throw slotError;
      }
      
      refreshBookings();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating booking status:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  return {
    bookings,
    loading,
    error,
    refreshBookings,
    createBooking,
    updateBookingStatus
  };
}
