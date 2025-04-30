import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import dayjs from 'dayjs';

export default function useSlots(groundId, date = null) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    date || dayjs().format('YYYY-MM-DD')
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to refresh slots
  const refreshSlots = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Change selected date
  const changeDate = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Fetch slots for the selected date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!groundId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('slots')
          .select('*, bookings(*)')
          .eq('ground_id', groundId)
          .eq('date', selectedDate)
          .order('start_time');
          
        if (error) throw error;
        
        setSlots(data || []);
      } catch (error) {
        console.error('Error fetching slots:', error.message);
        setError('Failed to load time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('slots_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'slots',
        filter: `ground_id=eq.${groundId}` 
      }, (payload) => {
        // Only refresh if the change affects the current selected date
        if (payload.new && payload.new.date === selectedDate) {
          fetchSlots();
        }
      })
      .subscribe();
      
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [groundId, selectedDate, refreshTrigger]);
  
  // Add a new slot
  const addSlot = async (startTime, endTime) => {
    try {
      // Validate times
      if (!startTime || !endTime) {
        throw new Error('Start time and end time are required');
      }
      
      const start = dayjs(`2000-01-01 ${startTime}`);
      const end = dayjs(`2000-01-01 ${endTime}`);
      
      if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid time format');
      }
      
      if (end.isBefore(start) || end.isSame(start)) {
        throw new Error('End time must be after start time');
      }
      
      // Check for overlapping with existing slots
      for (const slot of slots) {
        const existingStart = dayjs(`2000-01-01 ${slot.start_time}`);
        const existingEnd = dayjs(`2000-01-01 ${slot.end_time}`);
        
        if (
          (start.isAfter(existingStart) && start.isBefore(existingEnd)) ||
          (end.isAfter(existingStart) && end.isBefore(existingEnd)) ||
          (start.isSame(existingStart) || end.isSame(existingEnd)) ||
          (start.isBefore(existingStart) && end.isAfter(existingEnd))
        ) {
          throw new Error('This time slot overlaps with an existing slot');
        }
      }
      
      // Create the slot
      const { data, error } = await supabase
        .from('slots')
        .insert([
          {
            ground_id: groundId,
            date: selectedDate,
            start_time: startTime,
            end_time: endTime,
            is_booked: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      refreshSlots();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error adding slot:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Delete a slot
  const deleteSlot = async (slotId) => {
    try {
      // Check if slot has bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('slot_id', slotId)
        .not('status', 'eq', 'cancelled');
        
      if (bookingsError) throw bookingsError;
      
      if (bookingsData && bookingsData.length > 0) {
        throw new Error('Cannot delete a slot with active bookings');
      }
      
      // Delete the slot
      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', slotId);
        
      if (error) throw error;
      
      refreshSlots();
      return { success: true };
    } catch (error) {
      console.error('Error deleting slot:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Get slots for next 7 days
  const getAvailableDays = async () => {
    try {
      if (!groundId) return { success: false, error: 'Ground ID is required' };
      
      const startDate = dayjs().format('YYYY-MM-DD');
      const endDate = dayjs().add(7, 'day').format('YYYY-MM-DD');
      
      const { data, error } = await supabase
        .from('slots')
        .select('date, is_booked')
        .eq('ground_id', groundId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');
        
      if (error) throw error;
      
      // Process the data to show availability by date
      const days = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = dayjs().add(i, 'day').format('YYYY-MM-DD');
        const slotsForDay = data?.filter(slot => slot.date === currentDate) || [];
        const availableSlots = slotsForDay.filter(slot => !slot.is_booked).length;
        
        days.push({
          date: currentDate,
          display: i === 0 ? 'Today' : dayjs(currentDate).format('ddd, MMM D'),
          totalSlots: slotsForDay.length,
          availableSlots
        });
      }
      
      return { success: true, data: days };
    } catch (error) {
      console.error('Error fetching available days:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  return {
    slots,
    loading,
    error,
    selectedDate,
    changeDate,
    refreshSlots,
    addSlot,
    deleteSlot,
    getAvailableDays
  };
}
