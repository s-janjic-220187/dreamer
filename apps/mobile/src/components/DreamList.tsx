import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControlProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface DreamListProps {
  dreams: Array<{
    id: string
    title: string
    content: string
    mood: string
    createdAt: string
    tags: string[]
  }>
  onDreamPress: (dreamId: string) => void
  onAddDreamPress: () => void
  onSettingsPress?: () => void
  refreshControl?: React.ReactElement<RefreshControlProps>
}

export const DreamList: React.FC<DreamListProps> = ({
  dreams,
  onDreamPress,
  onAddDreamPress,
  onSettingsPress,
  refreshControl
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Dreams</Text>
        </View>
        <View style={styles.headerRight}>
          {onSettingsPress && (
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={onSettingsPress}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={onAddDreamPress}
          >
            <Text style={styles.addButtonText}>+ Add Dream</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={refreshControl}
      >
        {dreams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No dreams recorded yet. Start by adding your first dream!
            </Text>
          </View>
        ) : (
          dreams.map(dream => (
            <TouchableOpacity
              key={dream.id}
              style={styles.dreamCard}
              onPress={() => onDreamPress(dream.id)}
            >
              <View style={styles.dreamHeader}>
                <Text style={styles.dreamTitle}>{dream.title}</Text>
                <View 
                  style={[
                    styles.moodIndicator,
                    { backgroundColor: getMoodColor(dream.mood) }
                  ]}
                />
              </View>
              
              <Text style={styles.dreamContent} numberOfLines={3}>
                {dream.content}
              </Text>
              
              <View style={styles.dreamFooter}>
                <Text style={styles.dreamDate}>
                  {formatDate(dream.createdAt)}
                </Text>
                
                <View style={styles.tagsContainer}>
                  {dream.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {dream.tags.length > 2 && (
                    <Text style={styles.moreTags}>+{dream.tags.length - 2}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    borderBottomColor: '#16213e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dreamCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  moodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  dreamContent: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  tagText: {
    color: '#d1d5db',
    fontSize: 10,
  },
  moreTags: {
    color: '#9ca3af',
    fontSize: 10,
    marginLeft: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 18,
  },
})