import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import {
  Text,
  FAB,
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import EmptyState from "../../components/EmptyState";
import ErrorComponent from "../../components/ErrorComponent";

export default function GroundsListScreen({ navigation }) {
  const { user } = useAuth();

  // State variables
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true); // Track first load

  // Fetch grounds owned by the current user
  const fetchGrounds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("grounds")
        .select("*")
        .eq("owner_id", user.id)
        .order("name");

      if (error) throw error;
      setGrounds(data || []);
    } catch (error) {
      console.error("Error fetching grounds:", error.message);
      setError("Failed to load your grounds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGrounds();
    setRefreshing(false);
  };

  // Initial fetch of grounds, only trigger when firstLoad is true
  useEffect(() => {
    if (firstLoad) {
      fetchGrounds();
      setFirstLoad(false); // Set first load to false after the initial fetch
    }

    // Subscribe to realtime changes for grounds
    const subscription = supabase
      .channel("grounds_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grounds",
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh grounds when changes occur
          fetchGrounds();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, firstLoad]); // Now only fetch if firstLoad is true

  // Navigate to edit ground screen
  const handleEditGround = (ground) => {
    navigation.navigate("AddEditGround", {
      groundId: ground.id,
      ground,
    });
  };

  // Navigate to manage slots screen
  const handleManageSlots = (ground) => {
    navigation.navigate("SlotsManagement", {
      groundId: ground.id,
      groundName: ground.name,
    });
  };

  // Delete ground
  const handleDeleteGround = (groundId) => {
    Alert.alert(
      "Delete Ground",
      "Are you sure you want to delete this ground? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // First check if there are any bookings for this ground's slots
              const { data: slots, error: slotsError } = await supabase
                .from("slots")
                .select("id")
                .eq("ground_id", groundId);

              if (slotsError) throw slotsError;

              if (slots && slots.length > 0) {
                const slotIds = slots.map((slot) => slot.id);

                const { data: bookings, error: bookingsError } = await supabase
                  .from("bookings")
                  .select("id")
                  .in("slot_id", slotIds)
                  .not("status", "eq", "cancelled");

                if (bookingsError) throw bookingsError;

                if (bookings && bookings.length > 0) {
                  Alert.alert(
                    "Cannot Delete",
                    "This ground has active bookings. Cancel all bookings before deleting the ground.",
                    [{ text: "OK" }]
                  );
                  return;
                }

                // Delete all slots for this ground
                const { error: deleteSlotError } = await supabase
                  .from("slots")
                  .delete()
                  .eq("ground_id", groundId);

                if (deleteSlotError) throw deleteSlotError;
              }

              // Delete the ground
              const { error: deleteGroundError } = await supabase
                .from("grounds")
                .delete()
                .eq("id", groundId);

              if (deleteGroundError) throw deleteGroundError;

              // Remove from local state
              setGrounds(grounds.filter((ground) => ground.id !== groundId));

              Alert.alert("Success", "Ground deleted successfully");
            } catch (error) {
              console.error("Error deleting ground:", error.message);
              Alert.alert(
                "Error",
                "Failed to delete ground. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Render ground card
  const renderGroundCard = (item, i) => {
    return (
      <Card style={styles.card} key={i}>
        <Card.Cover
          source={{
            uri:
              item?.image_url ||
              "https://via.placeholder.com/300x150?text=No+Image",
          }}
          style={styles.cardImage}
        />
        <Card.Content style={styles.cardContent}>
          <Title>{item?.name}</Title>
          <Paragraph style={styles?.location}>{item?.location}</Paragraph>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item?.price_per_hour}/hour</Text>
            <Text style={styles.turfType}>{item?.turf_type}</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleManageSlots(item)}
            icon="calendar"
          >
            Slots
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleEditGround(item)}
            icon="pencil"
          >
            Edit
          </Button>
          <IconButton
            icon="delete"
            color="#D32F2F"
            size={20}
            onPress={() => handleDeleteGround(item.id)}
          />
        </Card.Actions>
      </Card>
    );
  };

  // Render loading state
  if (loading && !refreshing && grounds.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading your grounds...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchGrounds} />;
  }

  // Render empty state
  if (!loading && grounds.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="cricket"
          title="No Grounds Yet"
          message="You haven't added any cricket grounds yet. Tap the + button to add your first ground."
          buttonText="Add Ground"
          onButtonPress={() => navigation.navigate("AddEditGround")}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate("AddEditGround")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E88E5"]}
          />
        }
        contentContainerStyle={styles.list}
      >
        {grounds.map((item, index) => (
          <React.Fragment key={item.id || index}>
            {renderGroundCard(item)}
          </React.Fragment>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddEditGround")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 150,
  },
  cardContent: {
    paddingVertical: 12,
  },
  location: {
    color: "#666",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontWeight: "bold",
    color: "#1E88E5",
  },
  turfType: {
    color: "#555",
    fontStyle: "italic",
  },
  cardActions: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#1E88E5",
  },
});
