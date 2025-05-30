import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Title, 
  HelperText, 
  Divider,
  SegmentedButtons,
  ActivityIndicator,
  Text,
  Card,
  IconButton,
  Chip,
  Surface,
  Menu,
  Modal,
  Portal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ErrorComponent from '../../components/ErrorComponent';
import MediaService from '../../services/MediaService';
import RazorpayService from '../../services/RazorpayService';
import ModernHeader from '../../components/ui/ModernHeader';
import ThemedButton from '../../components/ui/ThemedButton';
import ThemedCard from '../../components/ui/ThemedCard';

const { width } = Dimensions.get('window');

export default function AddEditGroundScreen({ route, navigation }) {
  const { groundId, ground } = route.params || {};
  const isEditing = !!groundId;
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // State variables
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [turfType, setTurfType] = useState('');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState([]);
  
  // Media state
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mediaChanged, setMediaChanged] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // UI state for media picker
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Validation state
  const [nameError, setNameError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [turfTypeError, setTurfTypeError] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  
  // Fetch ground details if editing
  const fetchGroundDetails = async () => {
    if (!isEditing) {
      setInitialLoading(false);
      return;
    }
    
    try {
      setInitialLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('grounds')
        .select('*')
        .eq('id', groundId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setName(data.name || '');
        setLocation(data.location || '');
        setPrice(data.price_per_hour ? data.price_per_hour.toString() : '');
        setTurfType(data.turf_type || '');
        setDescription(data.description || '');
        setImageUri(data.image_url || null);
      }
    } catch (error) {
      console.error('Error fetching ground details:', error.message);
      setError('Failed to load ground details. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };
  
  // Initialize form with existing data if editing
  useEffect(() => {
    if (ground) {
      setName(ground.name || '');
      setLocation(ground.location || '');
      setPrice(ground.price_per_hour ? ground.price_per_hour.toString() : '');
      setTurfType(ground.turf_type || '');
      setDescription(ground.description || '');
      setImageUri(ground.image_url || null);
      setInitialLoading(false);
    } else if (isEditing) {
      fetchGroundDetails();
    } else {
      setInitialLoading(false);
    }
  }, [ground, isEditing]);
  
  // Validate form inputs
  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setNameError('');
    setLocationError('');
    setPriceError('');
    setTurfTypeError('');
    
    // Validate name
    if (!name.trim()) {
      setNameError('Ground name is required');
      isValid = false;
    }
    
    // Validate location
    if (!location.trim()) {
      setLocationError('Location is required');
      isValid = false;
    }
    
    // Validate price
    if (!price) {
      setPriceError('Price per hour is required');
      isValid = false;
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setPriceError('Price must be a positive number');
      isValid = false;
    }
    
    // Validate turf type
    if (!turfType) {
      setTurfTypeError('Turf type is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Available facilities
  const availableFacilities = [
    'Parking', 'Washroom', 'Drinking Water', 'First Aid', 'Lighting',
    'Seating Area', 'Changing Room', 'Equipment Rental', 'Refreshments', 'Security'
  ];

  // Media handling functions
  const handleAddImages = async () => {
    try {
      const selectedImages = await MediaService.pickImages(true);
      if (selectedImages.length > 0) {
        const newImages = [...images, ...selectedImages];
        if (newImages.length > MediaService.maxImages) {
          Alert.alert(
            'Too Many Images',
            `You can only upload up to ${MediaService.maxImages} images. Please select fewer images.`
          );
          return;
        }
        setImages(newImages);
        setMediaChanged(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
    setShowMediaMenu(false);
  };

  const handleAddVideos = async () => {
    try {
      const selectedVideos = await MediaService.pickVideos(true);
      if (selectedVideos.length > 0) {
        const newVideos = [...videos, ...selectedVideos];
        if (newVideos.length > MediaService.maxVideos) {
          Alert.alert(
            'Too Many Videos',
            `You can only upload up to ${MediaService.maxVideos} videos. Please select fewer videos.`
          );
          return;
        }
        setVideos(newVideos);
        setMediaChanged(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select videos. Please try again.');
    }
    setShowMediaMenu(false);
  };

  const handleCapturePhoto = async () => {
    try {
      const photo = await MediaService.capturePhoto();
      if (photo) {
        const newImages = [...images, photo];
        if (newImages.length > MediaService.maxImages) {
          Alert.alert(
            'Too Many Images',
            `You can only upload up to ${MediaService.maxImages} images.`
          );
          return;
        }
        setImages(newImages);
        setMediaChanged(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
    setShowMediaMenu(false);
  };

  const handleCaptureVideo = async () => {
    try {
      const video = await MediaService.captureVideo();
      if (video) {
        const newVideos = [...videos, video];
        if (newVideos.length > MediaService.maxVideos) {
          Alert.alert(
            'Too Many Videos',
            `You can only upload up to ${MediaService.maxVideos} videos.`
          );
          return;
        }
        setVideos(newVideos);
        setMediaChanged(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
    setShowMediaMenu(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setMediaChanged(true);
  };

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    setVideos(newVideos);
    setMediaChanged(true);
  };

  const addFacility = (facility) => {
    if (!facilities.includes(facility)) {
      setFacilities([...facilities, facility]);
    }
  };

  const removeFacility = (facility) => {
    setFacilities(facilities.filter(f => f !== facility));
  };
  
  // Upload media files to Supabase storage
  const uploadMediaFiles = async () => {
    if (!mediaChanged || (images.length === 0 && videos.length === 0)) {
      return { images: [], videos: [] };
    }

    try {
      setUploadingMedia(true);
      
      // Combine all media files
      const allFiles = [...images, ...videos];
      
      // Validate before upload
      const validationErrors = MediaService.validateMediaFiles(images, videos);
      if (validationErrors.length > 0) {
        Alert.alert('Validation Error', validationErrors.join('\n'));
        return { images: [], videos: [] };
      }

      // Upload to Supabase
      const uploadedFiles = await MediaService.uploadToSupabase(
        allFiles, 
        'ground-media', 
        user.id
      );

      // Separate uploaded images and videos
      const uploadedImages = uploadedFiles.filter(file => 
        file.type === 'image' && file.uploaded
      ).map(file => ({
        url: file.publicUrl,
        type: 'image',
        name: file.name,
        size: file.size,
        width: file.width,
        height: file.height,
        supabaseKey: file.supabaseKey,
      }));

      const uploadedVideos = uploadedFiles.filter(file => 
        file.type === 'video' && file.uploaded
      ).map(file => ({
        url: file.publicUrl,
        type: 'video',
        name: file.name,
        size: file.size,
        duration: file.duration,
        width: file.width,
        height: file.height,
        supabaseKey: file.supabaseKey,
      }));

      // Check for failed uploads
      const failedUploads = uploadedFiles.filter(file => !file.uploaded);
      if (failedUploads.length > 0) {
        const failedNames = failedUploads.map(file => file.name).join(', ');
        Alert.alert(
          'Upload Warning', 
          `Some files failed to upload: ${failedNames}. The ground will be saved with the successfully uploaded media.`
        );
      }

      return { images: uploadedImages, videos: uploadedVideos };
    } catch (error) {
      console.error('Error uploading media files:', error);
      Alert.alert('Upload Error', 'Failed to upload media files. Please try again.');
      throw error;
    } finally {
      setUploadingMedia(false);
    }
  };
  
  // Save ground data
  const saveGround = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      
      // Upload media files if any changes
      const uploadedMedia = await uploadMediaFiles();
      
      const groundData = {
        name: name.trim(),
        location: location.trim(),
        price_per_hour: parseFloat(price),
        turf_type: turfType,
        description: description.trim() || null,
        facilities: facilities,
        images: uploadedMedia.images,
        videos: uploadedMedia.videos,
        owner_id: user.id,
        updated_at: new Date().toISOString(),
      };
      
      if (isEditing) {
        // Update existing ground
        const { error } = await supabase
          .from('grounds')
          .update(groundData)
          .eq('id', groundId);
          
        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Ground updated successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new ground
        const { data, error } = await supabase
          .from('grounds')
          .insert([{
            ...groundData,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        // Show success with option to create premium listing
        Alert.alert(
          'Success',
          'Ground added successfully! Would you like to make it a featured listing for better visibility?',
          [
            { text: 'Not Now', onPress: () => navigation.goBack() },
            { 
              text: 'Make Featured', 
              onPress: () => handlePremiumUpgrade(data.id)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving ground:', error.message);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} ground. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle premium upgrade with Razorpay
  const handlePremiumUpgrade = async (groundId) => {
    try {
      const premiumPrice = 999; // ₹999 for featured listing
      
      const paymentResult = await RazorpayService.initiateBookingPayment({
        amount: premiumPrice,
        venueName: name,
        userName: user.email?.split('@')[0] || 'Ground Owner',
        userEmail: user.email,
        userPhone: user.phone || '',
        slotId: groundId,
      });

      if (paymentResult.success) {
        // Update ground to premium status
        const { error } = await supabase
          .from('grounds')
          .update({
            is_featured: true,
            featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            payment_id: paymentResult.paymentId,
          })
          .eq('id', groundId);

        if (error) throw error;

        Alert.alert(
          'Featured Listing Activated',
          'Your ground is now featured and will get better visibility for the next 30 days!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Premium upgrade failed:', error);
      Alert.alert(
        'Payment Failed', 
        'Featured listing upgrade failed. Your ground has been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };
  
  // Render loading state
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading ground details...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return <ErrorComponent message={error} onRetry={fetchGroundDetails} />;
  }
  
  // Render image items
  const renderImageItem = ({ item, index }) => (
    <ThemedCard style={styles.mediaCard}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      <IconButton
        icon="close"
        size={20}
        iconColor={theme.error}
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      />
      <View style={styles.mediaInfo}>
        <Text style={[styles.mediaName, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.mediaSize, { color: theme.textSecondary }]}>
          {MediaService.formatFileSize(item.size)}
        </Text>
      </View>
    </ThemedCard>
  );

  // Render video items
  const renderVideoItem = ({ item, index }) => (
    <ThemedCard style={styles.mediaCard}>
      <View style={styles.videoContainer}>
        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
        <View style={styles.videoOverlay}>
          <MaterialCommunityIcons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <IconButton
        icon="close"
        size={20}
        iconColor={theme.error}
        style={styles.removeButton}
        onPress={() => removeVideo(index)}
      />
      <View style={styles.mediaInfo}>
        <Text style={[styles.mediaName, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.mediaSize, { color: theme.textSecondary }]}>
          {MediaService.formatFileSize(item.size)} • {MediaService.formatDuration(item.duration)}
        </Text>
      </View>
    </ThemedCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader 
        title={isEditing ? 'Edit Ground' : 'Add New Ground'}
        showBack={true}
        onBack={() => navigation.goBack()}
        showThemeToggle={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Media Upload Section */}
          <ThemedCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Ground Photos & Videos
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Add up to {MediaService.maxImages} photos and {MediaService.maxVideos} videos to showcase your ground
            </Text>
            
            {/* Images Grid */}
            {images.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={[styles.mediaSectionTitle, { color: theme.text }]}>
                  Photos ({images.length}/{MediaService.maxImages})
                </Text>
                <FlatList
                  data={images}
                  renderItem={renderImageItem}
                  keyExtractor={(item, index) => `image_${index}`}
                  numColumns={2}
                  style={styles.mediaGrid}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Videos Grid */}
            {videos.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={[styles.mediaSectionTitle, { color: theme.text }]}>
                  Videos ({videos.length}/{MediaService.maxVideos})
                </Text>
                <FlatList
                  data={videos}
                  renderItem={renderVideoItem}
                  keyExtractor={(item, index) => `video_${index}`}
                  numColumns={2}
                  style={styles.mediaGrid}
                  scrollEnabled={false}
                />
              </View>
            )}
            
            <Menu
              visible={showMediaMenu}
              onDismiss={() => setShowMediaMenu(false)}
              anchor={
                <ThemedButton
                  mode="outlined"
                  onPress={() => setShowMediaMenu(true)}
                  icon="camera-plus"
                  variant="outline"
                >
                  Add Media ({images.length + videos.length}/{MediaService.maxImages + MediaService.maxVideos})
                </ThemedButton>
              }
            >
              <Menu.Item
                onPress={handleAddImages}
                title="Choose Photos from Gallery"
                leadingIcon="image-multiple"
              />
              <Menu.Item
                onPress={handleAddVideos}
                title="Choose Videos from Gallery"
                leadingIcon="video-multiple"
              />
              <Menu.Item
                onPress={handleCapturePhoto}
                title="Take Photo"
                leadingIcon="camera"
              />
              <Menu.Item
                onPress={handleCaptureVideo}
                title="Record Video"
                leadingIcon="video"
              />
            </Menu>

            {(images.length > 0 || videos.length > 0) && uploadingMedia && (
              <View style={styles.uploadProgress}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.uploadText, { color: theme.textSecondary }]}>
                  Uploading media files...
                </Text>
              </View>
            )}
          </ThemedCard>
        
          {/* Basic Details Section */}
          <ThemedCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Basic Details
            </Text>
            
            <TextInput
              label="Ground Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!nameError}
            />
            <HelperText type="error" visible={!!nameError}>
              {nameError}
            </HelperText>
            
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={styles.input}
              error={!!locationError}
            />
            <HelperText type="error" visible={!!locationError}>
              {locationError}
            </HelperText>
            
            <TextInput
              label="Price per Hour (₹)"
              value={price}
              onChangeText={setPrice}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!priceError}
              left={<TextInput.Affix text="₹" />}
            />
            <HelperText type="error" visible={!!priceError}>
              {priceError}
            </HelperText>
          </ThemedCard>

          {/* Turf Type Section */}
          <ThemedCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Turf Type
            </Text>
            <SegmentedButtons
              value={turfType}
              onValueChange={setTurfType}
              buttons={[
                { value: 'mat', label: 'Mat' },
                { value: 'astro', label: 'Astro' },
                { value: 'grass', label: 'Grass' },
                { value: 'synthetic', label: 'Synthetic' }
              ]}
              style={styles.segmentedButton}
            />
            <HelperText type="error" visible={!!turfTypeError}>
              {turfTypeError}
            </HelperText>
          </ThemedCard>

          {/* Facilities Section */}
          <ThemedCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Facilities Available
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select facilities available at your ground
            </Text>
            
            <View style={styles.facilitiesContainer}>
              {availableFacilities.map((facility) => (
                <Chip
                  key={facility}
                  selected={facilities.includes(facility)}
                  onPress={() => facilities.includes(facility) ? removeFacility(facility) : addFacility(facility)}
                  style={styles.facilityChip}
                  textStyle={{ fontSize: 12 }}
                >
                  {facility}
                </Chip>
              ))}
            </View>
          </ThemedCard>

          {/* Description Section */}
          <ThemedCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Description
            </Text>
            <TextInput
              label="Tell us more about your ground (optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Describe special features, location details, or any other information..."
            />
          </ThemedCard>
          
          <View style={styles.buttonContainer}>
            <ThemedButton
              mode="contained"
              onPress={saveGround}
              loading={loading || uploadingMedia}
              disabled={loading || uploadingMedia}
              icon={isEditing ? "content-save" : "plus"}
              variant="primary"
            >
              {loading || uploadingMedia 
                ? (uploadingMedia ? 'Uploading Media...' : 'Saving...') 
                : (isEditing ? 'Update Ground' : 'Add Ground')
              }
            </ThemedButton>
            
            <ThemedButton
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading || uploadingMedia}
              variant="outline"
              style={styles.cancelButton}
            >
              Cancel
            </ThemedButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  mediaGrid: {
    marginBottom: 16,
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mediaCard: {
    flex: 1,
    margin: 4,
    padding: 8,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  mediaInfo: {
    alignItems: 'center',
  },
  mediaName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  mediaSize: {
    fontSize: 10,
    textAlign: 'center',
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 14,
  },
  input: {
    marginBottom: 8,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityChip: {
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});
