import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../context/ThemeContext";
import ThemedCard from "./ui/ThemedCard";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width - 32;
const ITEM_WIDTH = SLIDER_WIDTH;

const VenueCard = ({ venue, navigation, onPress }) => {
  const { theme } = useTheme();

  // Safely combine images and videos
  const mediaItems = React.useMemo(() => {
    return [
      ...(venue?.images?.map((img) => ({
        type: "image",
        url: img?.url,
        id: img?.id || Math.random().toString(),
      })) || []),
      ...(venue?.videos?.map((vid) => ({
        type: "video",
        url: vid?.url,
        thumbnail: vid?.thumbnail,
        id: vid?.id || Math.random().toString(),
      })) || []),
    ].filter((item) => item.url);
  }, [venue]);

  const styles = StyleSheet.create({
    card: {
      marginVertical: 8,
      marginHorizontal: 16,
      overflow: "hidden",
    },
    cardImage: {
      height: 180,
      backgroundColor: theme.border,
    },
    overlay: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    overlayText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "bold",
    },
    cardContent: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    location: {
      color: theme.textSecondary,
      marginLeft: 6,
      flex: 1,
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.success + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    price: {
      fontWeight: "bold",
      color: theme.success,
      marginLeft: 4,
    },
    turfChip: {
      backgroundColor: theme.primary + "20",
    },
    turfText: {
      color: theme.primary,
      fontWeight: "600",
    },
    ownerContainer: {
      flexDirection: "row",
      alignItems: "center",
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
      position: "absolute",
      top: 12,
      left: 12,
      backgroundColor: theme.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      zIndex: 10,
    },
    statusText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "bold",
    },
    carouselImage: {
      width: "100%",
      height: "100%",
    },
    carouselItemContainer: {
      width: ITEM_WIDTH,
      height: 180,
      borderRadius: 8,
      overflow: "hidden",
    },
    videoOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.3)",
    },
  });

  const renderMediaItem = ({ item }) => {
    if (!item) {
      return (
        <View
          style={[
            styles.carouselItemContainer,
            { backgroundColor: theme.border },
          ]}
        />
      );
    }
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("MediaViewerScreen", {
            mediaItems,
            initialIndex: mediaItems.findIndex((i) => i.id === item.id),
          })
        }
      >
        <View style={styles.carouselItemContainer}>
          {item.type === "image" ? (
            <Card.Cover
              source={{ uri: item.url }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <Card.Cover
                source={{ uri: item.thumbnail || item.url }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
              <View style={styles.videoOverlay}>
                <MaterialCommunityIcons
                  name="play-circle"
                  size={48}
                  color="white"
                />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const imageUri =
    venue?.image_url ||
    venue?.images?.[0]?.url ||
    "https://via.placeholder.com/400x180/4CAF50/FFFFFF?text=Cricket+Ground";

  if (!venue) {
    return null;
  }

  console.log(JSON.stringify(venue, null, 2));

  return (
    <ThemedCard style={styles.card} elevation={3} onPress={onPress}>
      <View>
        {mediaItems.length > 0 ? (
          <Carousel
            width={SLIDER_WIDTH}
            height={180}
            data={mediaItems}
            renderItem={renderMediaItem}
            loop
            autoPlay={mediaItems.length > 1}
            autoPlayInterval={5000}
            pagingEnabled
            snapEnabled
          />
        ) : (
          <Card.Cover
            source={{ uri: imageUri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

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

          <Chip style={styles.turfChip} textStyle={styles.turfText} mode="flat">
            {venue.turf_type?.charAt(0).toUpperCase() +
              venue.turf_type?.slice(1) || "Cricket Ground"}
          </Chip>
        </View>

        {venue.facilities && (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
          >
            {venue.facilities.map((facility, index) => (
              <Chip
                key={`facility-${index}`}
                style={{ marginRight: 6, marginBottom: 6 }}
                mode="outlined"
                textStyle={{ fontSize: 12 }}
              >
                {facility}
              </Chip>
            ))}
          </View>
        )}

        {venue.users && (
          <View style={styles.ownerContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={styles.ownerText}>
              Managed by {venue.users.name || "Ground Owner"}
            </Text>
          </View>
        )}
      </Card.Content>
    </ThemedCard>
  );
};

export default VenueCard;