import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Video from "react-native-video";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function MediaViewerScreen({ route, navigation }) {
  // Safely extract parameters with defaults
  const { mediaItems = [], initialIndex = 0 } = route.params || {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoError, setVideoError] = useState(false);

  // Process media items safely
  const processedMediaItems = useMemo(() => {
    return mediaItems.map((item) => ({
      ...item,
      type:
        item.type || (item.url?.match(/\.(mp4|mov|avi)$/i) ? "video" : "image"),
    }));
  }, [mediaItems]);

  // Filter images for the ImageViewer component
  const imagesForViewer = useMemo(() => {
    return processedMediaItems
      .filter((item) => item.type === "image")
      .map((item) => ({ url: item.url }));
  }, [processedMediaItems]);

  // Get current item safely
  const currentItem = processedMediaItems[currentIndex] || {};

  // Handle image index change
  const handleImageChange = (index) => {
    let imageCount = -1;
    for (let i = 0; i < processedMediaItems.length; i++) {
      if (processedMediaItems[i].type === "image") imageCount++;
      if (imageCount === index) {
        setCurrentIndex(i);
        break;
      }
    }
  };

  // Get current image index for ImageViewer
  const getCurrentImageIndex = () => {
    return (
      processedMediaItems
        .slice(0, currentIndex + 1)
        .filter((item) => item.type === "image").length - 1
    );
  };

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + processedMediaItems.length) % processedMediaItems.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % processedMediaItems.length);
  };

  if (!processedMediaItems.length) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No media items available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentItem.type === "image" ? (
        <ImageViewer
          imageUrls={imagesForViewer}
          index={getCurrentImageIndex()}
          onChange={(index) => index != null && handleImageChange(index)}
          enableSwipeDown
          onSwipeDown={() => navigation.goBack()}
          saveToLocalByLongPress={false}
          loadingRender={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        />
      ) : (
        <View style={styles.videoContainer}>
          {videoError ? (
            <View style={styles.center}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={50}
                color="white"
              />
              <Text style={styles.errorText}>Could not load video</Text>
            </View>
          ) : (
            <Video
              source={{ uri: currentItem.url }}
              style={styles.video}
              controls
              resizeMode="contain"
              onError={() => setVideoError(true)}
              paused={false}
            />
          )}
        </View>
      )}

      {/* Navigation controls */}
      {processedMediaItems.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, { left: 10 }]}
            onPress={goToPrevious}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={36}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, { right: 10 }]}
            onPress={goToNext}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={36}
              color="white"
            />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: width,
    height: height,
  },
  navButton: {
    position: "absolute",
    top: height / 2 - 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
    padding: 6,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
});
