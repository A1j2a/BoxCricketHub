import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Alert
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Title, 
  HelperText, 
  Divider,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import ErrorComponent from '../../components/ErrorComponent';

export default function AddEditGroundScreen({ route, navigation }) {
  const { groundId, ground } = route.params || {};
  const isEditing = !!groundId;
  const { user } = useAuth();
  
  // State variables
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [turfType, setTurfType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  
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
  
  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };
  
  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!imageUri || !imageChanged) {
      return imageUri; // Return existing image URL if not changed
    }
    
    try {
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Generate a unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `grounds/${user.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error.message);
      throw error;
    }
  };
  
  // Save ground data
  const saveGround = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      
      // Upload image if changed or new
      let imageUrl = imageUri;
      if (imageUri && imageChanged) {
        imageUrl = await uploadImage();
      }
      
      const groundData = {
        name: name.trim(),
        location: location.trim(),
        price_per_hour: parseFloat(price),
        turf_type: turfType,
        description: description.trim() || null,
        image_url: imageUrl,
        owner_id: user.id,
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
        const { error } = await supabase
          .from('grounds')
          .insert([groundData]);
          
        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Ground added successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving ground:', error.message);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} ground. Please try again.`);
    } finally {
      setLoading(false);
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
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Title style={styles.title}>
          {isEditing ? 'Edit Ground Details' : 'Add New Ground'}
        </Title>
        
        {/* Image Upload */}
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={48} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Ground Name */}
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
        
        {/* Location */}
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
        
        {/* Price per Hour */}
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
        
        {/* Turf Type */}
        <Text style={styles.segmentLabel}>Turf Type</Text>
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
        
        {/* Description */}
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={saveGround}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
          >
            {isEditing ? 'Update Ground' : 'Add Ground'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  input: {
    marginBottom: 5,
  },
  segmentLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
