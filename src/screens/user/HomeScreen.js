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
  Card,
  Surface,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../config/supabase";
import VenueCard from "../../components/VenueCard";
import FilterComponent from "../../components/FilterComponent";
import EmptyState from "../../components/EmptyState";
import ErrorComponent from "../../components/ErrorComponent";
import ModernHeader from "../../components/ui/ModernHeader";
import SearchBar from "../../components/ui/SearchBar";
import ThemedButton from "../../components/ui/ThemedButton";
import GradientBackground from "../../components/ui/GradientBackground";

export default function HomeScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const { theme } = useTheme();

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

      if (error) throw error;

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
    if (venues.length === 0) return;

    let results = [...venues];

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
  if (!loading && filteredVenues.length === 0 && !error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="BoxCricketHub"
          subtitle="Find your perfect cricket ground"
          actions={[
            {
              icon: "bell",
              onPress: () => navigation.navigate("Notifications"),
            },
          ]}
        />

        <SearchBar
          onSearch={setSearchQuery}
          onFilter={toggleFilters}
          value={searchQuery}
        />

        <View style={[styles.filterBar, { backgroundColor: theme.background }]}>
          {/* <ThemedButton
            mode="outlined"
            variant="outline"
            onPress={toggleFilters}
            icon="filter-variant"
            size="small"
          >
            Filters
          </ThemedButton> */}
          {(searchQuery ||
            filters.location ||
            filters.priceMin ||
            filters.priceMax ||
            filters.turfType) && (
            <ThemedButton
              mode="text"
              variant="outline"
              onPress={clearFilters}
              icon="close"
              size="small"
            >
              Clear
            </ThemedButton>
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="BoxCricketHub"
        subtitle={`Welcome back, ${
          userProfile?.name || user?.email?.split("@")[0] || "Player"
        }!`}
        actions={[
          { icon: "bell", onPress: () => navigation.navigate("Notifications") },
        ]}
      />

      <SearchBar
        onSearch={setSearchQuery}
        onFilter={toggleFilters}
        value={searchQuery}
        placeholder="Search cricket venues..."
      />

      <View style={[styles.filterBar, { backgroundColor: theme.background }]}>
        {/* <ThemedButton
          mode="outlined"
          variant="outline"
          onPress={toggleFilters}
          icon="filter-variant"
          size="small"
        >
          Filters
        </ThemedButton> */}
        {(searchQuery ||
          filters.location ||
          filters.priceMin ||
          filters.priceMax ||
          filters.turfType) && (
          <ThemedButton
            mode="text"
            variant="outline"
            onPress={clearFilters}
            icon="close"
            size="small"
          >
            Clear All
          </ThemedButton>
        )}
      </View>

      {showFilters && (
        <FilterComponent filters={filters} setFilters={setFilters} />
      )}

      <FlatList
        data={filteredVenues}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            onPress={() => handleVenuePress(item)}
            navigation={navigation}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: theme.background },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          filteredVenues.length > 0 ? (
            <Surface
              style={[styles.statsCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.resultCount, { color: theme.text }]}>
                {filteredVenues.length}{" "}
                {filteredVenues.length === 1 ? "venue" : "venues"} found
              </Text>
              <Text
                style={[styles.resultSubtext, { color: theme.textSecondary }]}
              >
                Book your perfect cricket ground today
              </Text>
            </Surface>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              animating={true}
              color={theme.primary}
              size="large"
              style={styles.loader}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: {
    paddingBottom: 20,
  },
  statsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultSubtext: {
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
});
