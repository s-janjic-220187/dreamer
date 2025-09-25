import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import { databaseService } from '../services/database'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export interface DreamCameraProps {
  dreamId?: string
  onImageCaptured: (imageUri: string, caption?: string) => void
  onClose: () => void
}

export const DreamCamera: React.FC<DreamCameraProps> = ({
  dreamId,
  onImageCaptured,
  onClose
}) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showCaptionModal, setShowCaptionModal] = useState(false)
  
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (!cameraPermission?.granted) {
      const cameraResult = await requestCameraPermission()
      if (!cameraResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to capture images for your dreams.',
          [
            { text: 'Cancel', style: 'cancel', onPress: onClose },
            { text: 'Grant Permission', onPress: requestCameraPermission }
          ]
        )
        return
      }
    }

    if (!mediaPermission?.granted) {
      const mediaResult = await requestMediaPermission()
      if (!mediaResult.granted) {
        Alert.alert(
          'Media Library Permission Required',
          'This app needs access to your media library to save dream images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestMediaPermission }
          ]
        )
      }
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return

    try {
      setIsCapturing(true)
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      })

      if (photo?.uri) {
        setCapturedImage(photo.uri)
        setShowCaptionModal(true)
      }
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Error', 'Failed to capture image. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  const saveImage = async () => {
    if (!capturedImage) return

    try {
      setIsSaving(true)

      // Create a unique filename for the dream image
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `dream_${dreamId || 'temp'}_${timestamp}.jpg`
      const documentDirectory = FileSystem.documentDirectory + 'dream_images/'
      
      // Ensure directory exists
      const directoryInfo = await FileSystem.getInfoAsync(documentDirectory)
      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true })
      }

      const finalUri = documentDirectory + filename
      
      // Copy the image to our app's document directory
      await FileSystem.copyAsync({
        from: capturedImage,
        to: finalUri
      })

      // Save to media library if permission granted
      if (mediaPermission?.granted) {
        try {
          await MediaLibrary.createAssetAsync(capturedImage)
        } catch (error) {
          console.log('Could not save to media library:', error)
          // Continue anyway, the image is still saved in app directory
        }
      }

      // Save to database if dreamId is provided
      if (dreamId) {
        await databaseService.addDreamImage(dreamId, finalUri, caption.trim() || undefined)
      }

      onImageCaptured(finalUri, caption.trim() || undefined)
      onClose()
    } catch (error) {
      console.error('Failed to save image:', error)
      Alert.alert('Error', 'Failed to save image. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setCaption('')
    setShowCaptionModal(false)
  }

  const handleClose = () => {
    if (capturedImage) {
      Alert.alert(
        'Discard Image?',
        'Are you sure you want to discard this image?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose }
        ]
      )
    } else {
      onClose()
    }
  }

  if (!cameraPermission?.granted) {
    return (
      <Modal visible={true} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📸 Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To capture images for your dreams, we need access to your camera.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={true} animationType="slide">
      <View style={styles.container}>
        {/* Camera View */}
        {!capturedImage && (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.topControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
                    <Text style={styles.controlButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.cameraTitle}>Dream Image</Text>
                  <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                    <Text style={styles.controlButtonText}>🔄</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomControls}>
                  <View style={styles.captureButtonContainer}>
                    <TouchableOpacity
                      style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                      onPress={takePicture}
                      disabled={isCapturing}
                    >
                      {isCapturing ? (
                        <ActivityIndicator color="#ffffff" size="large" />
                      ) : (
                        <View style={styles.captureButtonInner} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </CameraView>
          </>
        )}

        {/* Caption Modal */}
        <Modal
          visible={showCaptionModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.captionModalContainer}>
            <View style={styles.captionModal}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.captionTitle}>Add Image Caption</Text>
                
                {capturedImage && (
                  <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                )}

                <TextInput
                  style={styles.captionInput}
                  placeholder="Describe this image... (optional)"
                  placeholderTextColor="#9ca3af"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />

                <Text style={styles.captionCounter}>{caption.length}/200</Text>

                <View style={styles.captionButtons}>
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={retakePhoto}
                    disabled={isSaving}
                  >
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={saveImage}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Image</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomControls: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  captionModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  captionModal: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    maxHeight: screenHeight * 0.8,
  },
  captionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  captionInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  captionCounter: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
  captionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})