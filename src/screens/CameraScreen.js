import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { identifyVehicle } from '../utils/api';

export default function CameraScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasGalleryPermission(mediaStatus === 'granted');
        
        if (mediaStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Media library permission is required to use this app.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert(
          'Permission Error',
          'Failed to request permissions. Please try again.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const processImage = async (imageUri) => {
    setIsLoading(true);
    setVehicleInfo(null);
    
    try {
      if (!imageUri) {
        throw new Error('Invalid image: No image selected');
      }
      
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      }).catch(error => {
        console.error('Error converting image to base64:', error);
        throw new Error('Failed to process image: Could not convert to required format');
      });
      
      const result = await identifyVehicle(base64Image);
      
      if (!result || result.trim() === '') {
        throw new Error('Could not identify vehicle: API returned empty result');
      }
      
      setVehicleInfo(result);
    } catch (error) {
      console.error('Error processing image:', error);
      
      const errorMessage = error.message || 'Failed to identify vehicle. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImage = () => {
    setCapturedImage(null);
    setVehicleInfo(null);
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Identifying vehicle...</Text>
            </View>
          ) : vehicleInfo ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Vehicle Information</Text>
              <Text style={styles.resultText}>{vehicleInfo}</Text>
            </View>
          ) : null}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={resetImage}>
              <Text style={styles.buttonText}>Select Another Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.selectImageContainer}>
          <Text style={styles.instructionText}>
            Take a photo or select an image of a car to identify its make, model, and year.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  selectImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 5,
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  cameraButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 14,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
});
