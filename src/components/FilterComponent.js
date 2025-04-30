import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Chip, Text, Surface } from 'react-native-paper';
import { supabase } from '../config/supabase';

export default function FilterComponent({ filters, setFilters }) {
  const [turfTypes, setTurfTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Fetch distinct turf types and locations for filtering
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get distinct turf types
        const { data: turfData, error: turfError } = await supabase
          .from('grounds')
          .select('turf_type')
          .order('turf_type');
          
        if (!turfError && turfData) {
          // Extract unique values
          const uniqueTurfTypes = [...new Set(turfData.map(item => item.turf_type))];
          setTurfTypes(uniqueTurfTypes);
        }
        
        // Get distinct locations (cities/areas)
        const { data: locationData, error: locationError } = await supabase
          .from('grounds')
          .select('location');
          
        if (!locationError && locationData) {
          // Extract city/area part from full addresses
          const extractedLocations = locationData.map(item => {
            const parts = item.location.split(',');
            return parts.length > 1 ? parts[parts.length - 2].trim() : item.location;
          });
          
          // Get unique values
          const uniqueLocations = [...new Set(extractedLocations)];
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error.message);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  return (
    <Surface style={styles.container}>
      <View style={styles.priceContainer}>
        <Text style={styles.filterLabel}>Price Range (₹):</Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            label="Min"
            value={filters.priceMin}
            onChangeText={(text) => setFilters({ ...filters, priceMin: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.priceInput}
            dense
            left={<TextInput.Affix text="₹" />}
          />
          <Text style={styles.priceSeparator}>-</Text>
          <TextInput
            label="Max"
            value={filters.priceMax}
            onChangeText={(text) => setFilters({ ...filters, priceMax: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.priceInput}
            dense
            left={<TextInput.Affix text="₹" />}
          />
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <Text style={styles.filterLabel}>Location:</Text>
        <TextInput
          label="Enter location"
          value={filters.location}
          onChangeText={(text) => setFilters({ ...filters, location: text })}
          mode="outlined"
          style={styles.locationInput}
          dense
        />
        <View style={styles.chipsContainer}>
          {locations.slice(0, 5).map((location) => (
            <Chip
              key={location}
              style={styles.chip}
              onPress={() => setFilters({ ...filters, location })}
              selected={filters.location === location}
            >
              {location}
            </Chip>
          ))}
        </View>
      </View>
      
      <View style={styles.turfTypeContainer}>
        <Text style={styles.filterLabel}>Turf Type:</Text>
        <View style={styles.chipsContainer}>
          {turfTypes.map((type) => (
            <Chip
              key={type}
              style={styles.chip}
              onPress={() => setFilters({ ...filters, turfType: filters.turfType === type ? '' : type })}
              selected={filters.turfType === type}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Chip>
          ))}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationInput: {
    marginBottom: 8,
  },
  turfTypeContainer: {
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    margin: 4,
  },
});
