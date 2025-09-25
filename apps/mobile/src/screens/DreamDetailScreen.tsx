import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDreamStore, type Dream } from '../stores/dreamStore'

export interface DreamDetailProps {
  dreamId: string
  onEdit: (dreamId: string) => void
  onBack: () => void
}

export const DreamDetail: React.FC<DreamDetailProps> = ({
  dreamId,
  onEdit,
  onBack
}) => {
  const { getDream, deleteDream, isLoading } = useDreamStore()
  const [dream, setDream] = useState<Dream | null>(null)

  useEffect(() => {
    const dreamData = getDream(dreamId)
    setDream(dreamData || null)
  }, [dreamId, getDream])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return '#10b981'
      case 'negative': return '#ef4444'
      case 'neutral': return '#6b7280'
      case 'anxious': return '#f59e0b'
      case 'peaceful': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getMoodLabel = (mood: string) => {
    return mood.charAt(0).toUpperCase() + mood.slice(1)
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDream(dreamId)
              onBack()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete dream. Please try again.')
            }
          }
        }
      ]
    )
  }

  const handleShare = () => {
    // Placeholder for future sharing functionality
    Alert.alert('Share Dream', 'Dream sharing feature coming soon!', [{ text: 'OK' }])
  }

  if (!dream) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Dream Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            The requested dream could not be found.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dream Details</Text>
        <TouchableOpacity onPress={() => onEdit(dreamId)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dream Title and Mood */}
        <View style={styles.titleSection}>
          <Text style={styles.dreamTitle}>{dream.title}</Text>
          <View style={styles.moodContainer}>
            <View 
              style={[
                styles.moodIndicator,
                { backgroundColor: getMoodColor(dream.mood) }
              ]}
            />
            <Text style={styles.moodText}>{getMoodLabel(dream.mood)}</Text>
          </View>
        </View>

        {/* Dream Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Content</Text>
          <Text style={styles.dreamContent}>{dream.content}</Text>
        </View>

        {/* Tags */}
        {dream.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {dream.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Information</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Recorded:</Text>
            <Text style={styles.dateText}>{formatDate(dream.createdAt)}</Text>
          </View>
          {dream.updatedAt !== dream.createdAt && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Last Updated:</Text>
              <Text style={styles.dateText}>{formatDate(dream.updatedAt)}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>📤 Share Dream</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(dreamId)}>
            <Text style={styles.actionButtonText}>✏️ Edit Dream</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              {isLoading ? '🔄 Deleting...' : '🗑️ Delete Dream'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  backButton: {
    fontSize: 16,
    color: '#6366f1',
  },
  editButton: {
    fontSize: 16,
    color: '#6366f1',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  dreamTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 32,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  moodText: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: '500',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  dreamContent: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    width: 100,
  },
  dateText: {
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
  },
  actionsSection: {
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: '#1f1214',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
})