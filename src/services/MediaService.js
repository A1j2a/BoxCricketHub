import * as ImagePicker from 'expo-image-picker';
// Removed expo-media-library dependency
import { Alert } from 'react-native';

class MediaService {
  constructor() {
    this.maxImages = 10;
    this.maxVideos = 3;
    this.maxImageSize = 5 * 1024 * 1024; // 5MB
    this.maxVideoSize = 50 * 1024 * 1024; // 50MB
  }

  async requestPermissions() {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and media library permissions are required to upload images and videos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  }

  async pickImages(allowMultiple = true) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowMultiple,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: !allowMultiple,
      });

      if (!result.canceled) {
        const validImages = [];

        for (const asset of result.assets) {
          if (asset.fileSize && asset.fileSize > this.maxImageSize) {
            Alert.alert(
              "File Too Large",
              `Image ${
                asset.fileName || "selected"
              } is too large. Maximum size is 5MB.`
            );
            continue;
          }

          validImages.push({
            uri: asset.uri,
            type: "image",
            name: asset.fileName || `image_${Date.now()}.jpg`,
            size: asset.fileSize,
            width: asset.width,
            height: asset.height,
          });
        }

        return validImages;
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to select images. Please try again.");
    }

    return [];
  }

  async pickVideos(allowMultiple = true) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: allowMultiple,
        quality: 0.7,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled) {
        const validVideos = [];

        for (const asset of result.assets) {
          if (asset.fileSize && asset.fileSize > this.maxVideoSize) {
            Alert.alert(
              "File Too Large",
              `Video ${
                asset.fileName || "selected"
              } is too large. Maximum size is 50MB.`
            );
            continue;
          }

          if (asset.duration && asset.duration > 60000) {
            // 60 seconds in milliseconds
            Alert.alert(
              "Video Too Long",
              `Video ${
                asset.fileName || "selected"
              } is too long. Maximum duration is 60 seconds.`
            );
            continue;
          }

          validVideos.push({
            uri: asset.uri,
            type: "video",
            name: asset.fileName || `video_${Date.now()}.mp4`,
            size: asset.fileSize,
            duration: asset.duration,
            width: asset.width,
            height: asset.height,
          });
        }

        return validVideos;
      }
    } catch (error) {
      console.error("Error picking videos:", error);
      Alert.alert("Error", "Failed to select videos. Please try again.");
    }

    return [];
  }

  async capturePhoto() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > this.maxImageSize) {
          Alert.alert(
            "File Too Large",
            "Captured image is too large. Maximum size is 5MB."
          );
          return null;
        }

        return {
          uri: asset.uri,
          type: "image",
          name: `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          width: asset.width,
          height: asset.height,
        };
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }

    return null;
  }

  async captureVideo() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.7,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > this.maxVideoSize) {
          Alert.alert(
            "File Too Large",
            "Recorded video is too large. Maximum size is 50MB."
          );
          return null;
        }

        return {
          uri: asset.uri,
          type: "video",
          name: `video_${Date.now()}.mp4`,
          size: asset.fileSize,
          duration: asset.duration,
          width: asset.width,
          height: asset.height,
        };
      }
    } catch (error) {
      console.error("Error capturing video:", error);
      Alert.alert("Error", "Failed to record video. Please try again.");
    }

    return null;
  }

  async uploadToSupabase(files, bucketName = "ground-medias", userId) {
    const { supabase } = await import("../config/supabase");
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Convert URI to blob for web/React Native compatibility
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const fileExt =
          file.name.split(".").pop() || (file.type === "image" ? "jpg" : "mp4");
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `${userId}/${file.type}s/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          uploadedFiles.push({
            ...file,
            uploaded: false,
            error: error.message,
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        uploadedFiles.push({
          ...file,
          uploadedPath: data.path,
          publicUrl: urlData.publicUrl,
          uploaded: true,
          supabaseKey: data.path,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        uploadedFiles.push({
          ...file,
          uploaded: false,
          error: error.message,
        });
      }
    }

    return uploadedFiles;
  }

  async deleteFromSupabase(filePaths, bucketName = "ground-medias") {
    const { supabase } = await import("../config/supabase");

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove(filePaths);

      if (error) {
        console.error("Error deleting files from Supabase:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting files:", error);
      return false;
    }
  }

  validateMediaFiles(images, videos) {
    const errors = [];

    if (images.length > this.maxImages) {
      errors.push(`Maximum ${this.maxImages} images allowed`);
    }

    if (videos.length > this.maxVideos) {
      errors.push(`Maximum ${this.maxVideos} videos allowed`);
    }

    return errors;
  }

  getMediaPreview(file) {
    return {
      uri: file.uri,
      type: file.type,
      name: file.name,
      size: this.formatFileSize(file.size),
      duration: file.duration ? this.formatDuration(file.duration) : null,
    };
  }

  formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}

export default new MediaService();