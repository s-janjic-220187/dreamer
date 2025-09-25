import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDreamStore, type Dream, type CreateDreamRequest, type UpdateDreamRequest } from '../stores/dreamStore'
import { VoiceRecorder } from './VoiceRecorder'
import { DreamCamera } from './DreamCamera'

export interface DreamFormProps {
  dreamId?: string
  onSave: (dream: Dream) => void
  onCancel: () => void
}

const MOOD_OPTIONS = [
  { value: 'positive', label: 'Positive', color: '#10b981' },
  { value: 'negative', label: 'Negative', color: '#ef4444' },
  { value: 'neutral', label: 'Neutral', color: '#6b7280' },
  { value: 'anxious', label: 'Anxious', color: '#f59e0b' },
  { value: 'peaceful', label: 'Peaceful', color: '#3b82f6' }
]

export const DreamForm: React.FC<DreamFormProps> = ({
  dreamId,
  onSave,
  onCancel
}) => {
  const { getDream, createDream, updateDream, isLoading } = useDreamStore()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImages, setCapturedImages] = useState<Array<{ uri: string; caption?: string }>>([])
  const isEditing = Boolean(dreamId)

  // Load existing dream if editing
  useEffect(() => {
    if (dreamId) {
      const dream = getDream(dreamId)
      if (dream) {
        setFormData({
          title: dream.title,
          content: dream.content,
          mood: dream.mood,
          tags: dream.tags.join(', ')
        })
      }
    }
  }, [dreamId, getDream])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Dream content is required'
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Please provide more detail about your dream (at least 10 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const dreamData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        mood: formData.mood,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      }

      let savedDream: Dream

      if (isEditing && dreamId) {
        savedDream = await updateDream(dreamId, dreamData as UpdateDreamRequest)
      } else {
        savedDream = await createDream(dreamData as CreateDreamRequest)
      }

      onSave(savedDream)
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'save'} dream. Please try again.`,
        [{ text: 'OK' }]
      )
    }
  }

  const handleCancel = () => {
    if (formData.title || formData.content) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onCancel }
        ]
      )
    } else {
      onCancel()
    }
  }

  const handleVoiceTranscription = (transcribedText: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${transcribedText}` : transcribedText
    }))
    setShowVoiceRecorder(false)
  }

  const handleVoiceError = (error: string) => {
    Alert.alert('Voice Recording Error', error)
    setShowVoiceRecorder(false)
  }

  const handleImageCaptured = (imageUri: string, caption?: string) => {
    setCapturedImages(prev => [...prev, { uri: imageUri, caption }])
    setShowCamera(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {isEditing ? 'Edit Dream' : 'New Dream'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Dream Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Dream Title</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter a title for your dream..."
              placeholderTextColor="#6b7280"
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Dream Content */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Dream Content</Text>
            <TextInput
              style={[styles.textArea, errors.content && styles.inputError]}
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="Describe your dream in detail..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
          </View>

          {/* Advanced Features */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>✨ Advanced Features</Text>
            <View style={styles.advancedFeaturesContainer}>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => setShowVoiceRecorder(true)}
              >
                <Text style={styles.featureButtonText}>🎤 Voice Record</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => setShowCamera(true)}
              >
                <Text style={styles.featureButtonText}>📸 Add Image</Text>
              </TouchableOpacity>
            </View>
            
            {capturedImages.length > 0 && (
              <View style={styles.imagesPreview}>
                <Text style={styles.imagesPreviewTitle}>
                  📷 {capturedImages.length} image(s) attached
                </Text>
              </View>
            )}
          </View>

          {/* Voice Recorder Modal */}
          {showVoiceRecorder && (
            <View style={styles.voiceRecorderContainer}>
              <VoiceRecorder
                onTranscriptionComplete={handleVoiceTranscription}
                onError={handleVoiceError}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowVoiceRecorder(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Camera Modal */}
          {showCamera && (
            <DreamCamera
              dreamId={dreamId}
              onImageCaptured={handleImageCaptured}
              onClose={() => setShowCamera(false)}
            />
          )}

          {/* Mood Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Mood</Text>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    formData.mood === mood.value && styles.moodOptionSelected,
                    { borderColor: mood.color }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                >
                  <View 
                    style={[styles.moodIndicator, { backgroundColor: mood.color }]}
                  />
                  <Text style={[
                    styles.moodText,
                    formData.mood === mood.value && styles.moodTextSelected
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
              placeholder="Enter tags separated by commas..."
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.helpText}>
              Use tags to categorize your dreams (e.g., flying, water, animals)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#94a3b8',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#4b5563',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 120,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  moodOptionSelected: {
    backgroundColor: '#374151',
  },
  moodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moodText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  moodTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  advancedFeaturesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  featureButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesPreview: {
    marginTop: 12,
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  imagesPreviewTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceRecorderContainer: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  closeButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})