import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for Supabase operations
export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
};

export const uploadImage = async (filePath, bucketName, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, filePath, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) throw error;
    
    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }
};
