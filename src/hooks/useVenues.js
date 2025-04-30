import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function useVenues(ownerId = null) {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to refresh venues
  const refreshVenues = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('grounds')
          .select('*, users(name)');
          
        // If ownerId is provided, filter by owner
        if (ownerId) {
          query = query.eq('owner_id', ownerId);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        setVenues(data || []);
      } catch (error) {
        console.error('Error fetching venues:', error.message);
        setError('Failed to load venues. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVenues();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('grounds_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'grounds',
        ...(ownerId ? { filter: `owner_id=eq.${ownerId}` } : {})
      }, () => {
        fetchVenues();
      })
      .subscribe();
      
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [ownerId, refreshTrigger]);
  
  // Add a new venue
  const addVenue = async (venueData) => {
    try {
      // Ensure owner_id is set
      const newVenue = {
        ...venueData,
        owner_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('grounds')
        .insert([newVenue])
        .select();
        
      if (error) throw error;
      
      refreshVenues();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error adding venue:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Update a venue
  const updateVenue = async (venueId, venueData) => {
    try {
      const { data, error } = await supabase
        .from('grounds')
        .update(venueData)
        .eq('id', venueId)
        .select();
        
      if (error) throw error;
      
      refreshVenues();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating venue:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Delete a venue
  const deleteVenue = async (venueId) => {
    try {
      const { error } = await supabase
        .from('grounds')
        .delete()
        .eq('id', venueId);
        
      if (error) throw error;
      
      refreshVenues();
      return { success: true };
    } catch (error) {
      console.error('Error deleting venue:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Get a single venue by ID
  const getVenueById = async (venueId) => {
    try {
      const { data, error } = await supabase
        .from('grounds')
        .select('*, users(name)')
        .eq('id', venueId)
        .single();
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching venue:', error.message);
      return { success: false, error: error.message };
    }
  };
  
  return {
    venues,
    loading,
    error,
    refreshVenues,
    addVenue,
    updateVenue,
    deleteVenue,
    getVenueById
  };
}
