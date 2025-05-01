import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import {
  Searchbar,
  Title,
  Text,
  Button,
  Chip,
  Divider,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext"; // Make sure this is correctly implemented
import { supabase } from "../../config/supabase";
import VenueCard from "../../components/VenueCard";
import FilterComponent from "../../components/FilterComponent";
import EmptyState from "../../components/EmptyState";
import ErrorComponent from "../../components/ErrorComponent";

export default function HomeScreen({ navigation }) {
  // State variables
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    location: "",
    priceMin: "",
    priceMax: "",
    turfType: "",
  });

  // Fetch venues from Supabase
  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("grounds")
        .select("*, users(name)")
        .order("name");

      if (error) {
        throw error;
      }

      // Ensure data is always an array, even if empty
      setVenues(data || []);
      setFilteredVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error.message);
      setError("Failed to load venues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  };

  // Initial fetch of venues
  useEffect(() => {
    fetchVenues();
  }, []);

  // Search and filter venues
  useEffect(() => {
    // Initialize results as an empty array.  This is CRUCIAL.
    let results = [];

    // Only filter if there is data.
    if (venues && venues.length > 0) {
      results = [...venues];

      // Apply search query
      if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(
          (venue) =>
            venue.name.toLowerCase().includes(lowercasedQuery) ||
            venue.location.toLowerCase().includes(lowercasedQuery) ||
            venue.turf_type.toLowerCase().includes(lowercasedQuery)
        );
      }

      // Apply location filter
      if (filters.location) {
        results = results.filter((venue) =>
          venue.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Apply price range filter
      if (filters.priceMin) {
        results = results.filter(
          (venue) =>
            parseFloat(venue.price_per_hour) >= parseFloat(filters.priceMin)
        );
      }

      if (filters.priceMax) {
        results = results.filter(
          (venue) =>
            parseFloat(venue.price_per_hour) <= parseFloat(filters.priceMax)
        );
      }

      // Apply turf type filter
      if (filters.turfType) {
        results = results.filter(
          (venue) =>
            venue.turf_type.toLowerCase() === filters.turfType.toLowerCase()
        );
      }
    }
    setFilteredVenues(results);
  }, [searchQuery, filters, venues]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      location: "",
      priceMin: "",
      priceMax: "",
      turfType: "",
    });
    setSearchQuery("");
  };

  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Navigate to venue details
  const handleVenuePress = (venue) => {
    navigation.navigate("VenueDetail", {
      venueId: venue.id,
      venueName: venue.name,
    });
  };

  // Render empty state
  if (!loading && filteredVenues && filteredVenues.length === 0 && !error) {
    return (
      <View style={styles.container}>
        <Searchbar
          placeholder="Search venues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterBar}>
          <Button mode="outlined" onPress={toggleFilters} icon="filter-variant">
            Filters
          </Button>
          {(searchQuery ||
            filters.location ||
            filters.priceMin ||
            filters.priceMax ||
            filters.turfType) && (
            <Button mode="text" onPress={clearFilters} icon="close">
              Clear
            </Button>
          )}
        </View>

        {showFilters && (
          <FilterComponent filters={filters} setFilters={setFilters} />
        )}

        <EmptyState
          icon="cricket"
          title="No venues found"
          message={
            searchQuery ||
            filters.location ||
            filters.priceMin ||
            filters.priceMax ||
            filters.turfType
              ? "No venues match your filters. Try adjusting your search criteria."
              : "There are no cricket venues available at the moment. Please check back later."
          }
          buttonText="Refresh"
          onButtonPress={onRefresh}
        />
      </View>
    );
  }

  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchVenues} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search venues..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterBar}>
        <Button mode="outlined" onPress={toggleFilters} icon="filter-variant">
          Filters
        </Button>
        {(searchQuery ||
          filters.location ||
          filters.priceMin ||
          filters.priceMax ||
          filters.turfType) && (
          <Button mode="text" onPress={clearFilters} icon="close">
            Clear
          </Button>
        )}
      </View>

      {showFilters && (
        <FilterComponent filters={filters} setFilters={setFilters} />
      )}

      {/* <FlatList
        data={filteredVenues || []}
        renderItem={({ item }) => (
          <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E88E5"]}
          />
        }
        ListHeaderComponent={
          filteredVenues?.length > 0 ? (
            <Text style={styles.resultCount}>
              {filteredVenues?.length}{" "}
              {filteredVenues?.length === 1 ? "venue" : "venues"} found
            </Text>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              animating={true}
              color="#1E88E5"
              size="large"
              style={styles.loader}
            />
          ) : null
        }
      /> */}
      <ScrollView
        contentContainerStyle={[
          styles.list,
          filteredVenues?.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E88E5"]}
          />
        }
      >
        {filteredVenues?.length > 0 ? (
          <Text style={styles.resultCount}>
            {filteredVenues?.length}{" "}
            {filteredVenues?.length === 1 ? "venue" : "venues"} found
          </Text>
        ) : (
          <Text style={styles.emptyMessage}>No venues found.</Text>
        )}

        {filteredVenues?.map((item) => (
          <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
        ))}

        {loading && !refreshing && filteredVenues?.length > 0 && (
          <ActivityIndicator
            animating={true}
            color="#1E88E5"
            size="large"
            style={styles.loader}
          />
        )}
        {loading && !refreshing && filteredVenues?.length === 0 && (
          <ActivityIndicator
            animating={true}
            color="#1E88E5"
            size="large"
            style={styles.loader}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  resultCount: {
    marginBottom: 12,
    fontSize: 14,
    color: "#666",
  },
  loader: {
    marginVertical: 20,
  },
});
