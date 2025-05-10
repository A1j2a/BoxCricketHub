// config/supabase.js
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

// Supabase configuration
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://vdqjojgsggzlgqezhyzf.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcWpvamdzZ2d6bGdxZXpoeXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDQzNTIsImV4cCI6MjA2MTU4MDM1Mn0.7oXD60fn92F5xmPt8KcvWeOLH2A-cxCWFVDvO-Dfi3g";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase credentials. Please check your environment variables."
  );
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
export const fetchUserProfile = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      console.error("Failed to get authenticated user:", error?.message);
      return null;
    }

    const user = data.user;

    // You can structure the returned profile however you need
    return user?.user_metadata || null;
  } catch (err) {
    console.error("Unexpected error in fetchUserProfile:", err.message);
    return null;
  }
};



export const uploadImage = async (uri, bucketName, fileName) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }
};
