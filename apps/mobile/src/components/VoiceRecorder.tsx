import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform
} from 'react-native'
import * as Speech from 'expo-speech'
import { Audio } from 'expo-av'

export interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onError,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [pulseAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    checkPermissions()
  }, [])

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation()
    } else {
      stopPulseAnimation()
    }
  }, [isRecording])

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      setHasPermission(status === 'granted')
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable microphone access to record voice notes for your dreams.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Permission error:', error)
      setHasPermission(false)
    }
  }

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const stopPulseAnimation = () => {
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const startRecording = async () => {
    if (!hasPermission) {
      await checkPermissions()
      return
    }

    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      
      setRecording(newRecording)
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      onError('Failed to start voice recording. Please try again.')
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      setIsRecording(false)
      setIsProcessing(true)
      
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      
      // For now, we'll simulate transcription
      // In a real app, you would send the audio to a transcription service
      await simulateTranscription(uri)
      
      setRecording(null)
    } catch (error) {
      console.error('Failed to stop recording:', error)
      onError('Failed to process voice recording. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateTranscription = async (audioUri: string | null) => {
    // Simulate processing time
    await new Promise<void>(resolve => setTimeout(resolve, 2000))
    
    // For demo purposes, return a sample transcription
    // In production, you would integrate with Google Speech-to-Text, Azure Speech, etc.
    const sampleTranscriptions = [
      "I had this amazing dream where I was flying over a vast ocean. The water was crystal clear and I could see dolphins swimming below me. It felt so peaceful and liberating.",
      "In my dream, I was back in my childhood home but everything was different. The rooms were much larger and there were new doors leading to places I'd never seen before.",
      "I dreamed I was in a forest made entirely of books. The trees had pages for leaves and words were falling like snow. I could read stories in the air around me.",
      "There was this incredible dream where I could communicate with animals. I had a long conversation with a wise old elephant about the meaning of time.",
      "I found myself in a city made of clouds where people could walk on air. The buildings were soft and white, and music seemed to come from everywhere."
    ]
    
    const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)]
    onTranscriptionComplete(randomTranscription)
  }

  const handlePress = async () => {
    if (disabled) return
    
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }

  const getButtonText = () => {
    if (isProcessing) return 'Processing...'
    if (isRecording) return 'Tap to Stop Recording'
    return 'Tap to Record Dream'
  }

  const getButtonStyle = () => {
    if (disabled || isProcessing) return [styles.button, styles.buttonDisabled]
    if (isRecording) return [styles.button, styles.buttonRecording]
    return [styles.button, styles.buttonIdle]
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Checking microphone permissions...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>🎤 Enable Microphone</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          Voice recording requires microphone access to transcribe your dreams.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={styles.buttonText}>
            {isRecording ? '🔴' : '🎤'} {getButtonText()}
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>Recording... Speak clearly about your dream</Text>
          <Text style={styles.recordingSubtext}>Tap the button again when finished</Text>
        </View>
      )}
      
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <Text style={styles.processingText}>🧠 Converting speech to text...</Text>
        </View>
      )}
      
      <Text style={styles.helpText}>
        Use voice recording to quickly capture your dreams when you wake up
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonIdle: {
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  buttonRecording: {
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
    borderWidth: 2,
    borderColor: '#374151',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingIndicator: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  recordingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingSubtext: {
    color: '#9ca3af',
    fontSize: 12,
  },
  processingIndicator: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  permissionText: {
    color: '#d1d5db',
    fontSize: 14,
  },
})