import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedCard from './ui/ThemedCard';

const { width } = Dimensions.get('window');

export default function VenueCard({ venue, onPress }) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      marginVertical: 8,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    cardImage: {
      height: 180,
      backgroundColor: theme.border,
    },
    overlay: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    overlayText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    cardContent: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    location: {
      color: theme.textSecondary,
      marginLeft: 6,
      flex: 1,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.success + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    price: {
      fontWeight: 'bold',
      color: theme.success,
      marginLeft: 4,
    },
    turfChip: {
      backgroundColor: theme.primary + '20',
    },
    turfText: {
      color: theme.primary,
      fontWeight: '600',
    },
    ownerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    ownerText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: theme.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    }
  });

  return (
    <ThemedCard style={styles.card} onPress={onPress} elevation={3}>
      <View>
        <Card.Cover 
          source={{ uri: venue.image_url || 'https://via.placeholder.com/400x180/4CAF50/FFFFFF?text=Cricket+Ground' }} 
          style={styles.cardImage}
        />
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Available</Text>
        </View>
        
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>₹{venue.price_per_hour}/hr</Text>
        </View>
      </View>

      <Card.Content style={styles.cardContent}>
        <Title style={styles.title}>{venue.name}</Title>
        
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={18} 
            color={theme.primary} 
          />
          <Paragraph style={styles.location} numberOfLines={1}>
            {venue.location}
          </Paragraph>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.priceContainer}>
            <MaterialCommunityIcons 
              name="currency-inr" 
              size={16} 
              color={theme.success} 
            />
            <Text style={styles.price}>{venue.price_per_hour}/hour</Text>
          </View>
          
          <Chip 
            style={styles.turfChip}
            textStyle={styles.turfText}
            mode="flat"
          >
            {venue.turf_type?.charAt(0).toUpperCase() + venue.turf_type?.slice(1) || 'Cricket Ground'}
          </Chip>
        </View>
        
        {venue.users && (
          <View style={styles.ownerContainer}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={16} 
              color={theme.textSecondary} 
            />
            <Text style={styles.ownerText}>
              Managed by {venue.users.name || 'Ground Owner'}
            </Text>
          </View>
        )}
      </Card.Content>
    </ThemedCard>
  );
}


