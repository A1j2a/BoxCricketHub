import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function VenueCard({ venue, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: venue.image_url || 'https://via.placeholder.com/300x150?text=No+Image' }} 
          style={styles.cardImage}
        />
        <Card.Content style={styles.cardContent}>
          <Title style={styles.title}>{venue.name}</Title>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Paragraph style={styles.location} numberOfLines={1}>
              {venue.location}
            </Paragraph>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.priceContainer}>
              <MaterialCommunityIcons name="currency-inr" size={16} color="#1E88E5" />
              <Text style={styles.price}>{venue.price_per_hour}/hour</Text>
            </View>
            <Chip style={styles.turfChip}>
              {venue.turf_type.charAt(0).toUpperCase() + venue.turf_type.slice(1)}
            </Chip>
          </View>
          {venue.users && (
            <View style={styles.ownerContainer}>
              <MaterialCommunityIcons name="account" size={14} color="#888" />
              <Text style={styles.ownerText}>
                By {venue.users.name || 'Unknown'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardImage: {
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    color: '#666',
    marginLeft: 4,
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
  },
  price: {
    fontWeight: 'bold',
    color: '#1E88E5',
    marginLeft: 2,
  },
  turfChip: {
    height: 26,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
});
