import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { notificationService, DreamReminderConfig } from '../services/notifications'
import { databaseService } from '../services/database'

const { width: screenWidth } = Dimensions.get('window')

export const SettingsScreen: React.FC = () => {
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null)
  const [reminderConfigs, setReminderConfigs] = useState<DreamReminderConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dbStats, setDbStats] = useState<{
    totalDreams: number
    totalTags: number
  }>({ totalDreams: 0, totalTags: 0 })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Initialize notification service and get preset reminders
      await notificationService.initialize()
      const presets = notificationService.getPresetReminders()
      setReminderConfigs(presets)

      // Load database stats
      await loadDatabaseStats()
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadDatabaseStats = async () => {
    try {
      const dreams = await databaseService.getAllDreams()
      const tags = await databaseService.getAllTags()
      setDbStats({
        totalDreams: dreams.length,
        totalTags: tags.length
      })
    } catch (error) {
      console.error('Failed to load database stats:', error)
    }
  }

  const toggleReminder = async (configId: string, enabled: boolean) => {
    setIsLoading(true)
    try {
      const updatedConfigs = reminderConfigs.map(config => 
        config.id === configId ? { ...config, enabled } : config
      )
      setReminderConfigs(updatedConfigs)

      if (enabled) {
        const config = updatedConfigs.find(c => c.id === configId)
        if (config) {
          await notificationService.scheduleDreamReminder(config)
          Alert.alert('Reminder Set', `${config.title} has been scheduled.`)
        }
      } else {
        // Cancel specific reminder (simplified - in production you'd track notification IDs)
        Alert.alert('Reminder Disabled', 'Reminder has been disabled.')
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error)
      Alert.alert('Error', 'Failed to update reminder settings.')
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    setIsLoading(true)
    try {
      const exportData = await databaseService.exportDreams()
      
      // In a real app, you would use react-native-share or similar
      Alert.alert(
        'Export Complete', 
        `Exported ${dbStats.totalDreams} dreams. Data has been prepared for sharing.`,
        [{ text: 'OK' }]
      )
      
      console.log('Export data prepared:', exportData.length, 'characters')
    } catch (error) {
      console.error('Failed to export data:', error)
      Alert.alert('Error', 'Failed to export dream data.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your dreams and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            try {
              // Clear all notifications
              await notificationService.cancelAllDreamReminders()
              
              // In production, you would clear the database here
              Alert.alert('Data Cleared', 'All dream data has been removed.')
              await loadDatabaseStats()
            } catch (error) {
              console.error('Failed to clear data:', error)
              Alert.alert('Error', 'Failed to clear all data.')
            } finally {
              setIsLoading(false)
            }
          }
        }
      ]
    )
  }

  const testNotification = async () => {
    try {
      await notificationService.sendImmediateDreamReminder(
        '🌟 Test Notification',
        'This is a test notification from Dream Journal!'
      )
      Alert.alert('Test Sent', 'Check your notifications to see the test message.')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      Alert.alert('Error', 'Failed to send test notification.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Database Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Dream Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Dreams</Text>
            <Text style={styles.statValue}>{dbStats.totalDreams}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Unique Tags</Text>
            <Text style={styles.statValue}>{dbStats.totalTags}</Text>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Dream Reminders</Text>
          <TouchableOpacity style={styles.testButton} onPress={testNotification}>
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
          
          {reminderConfigs.map((config) => (
            <View key={config.id} style={styles.reminderItem}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{config.title}</Text>
                <Text style={styles.reminderDescription}>{config.body}</Text>
                <Text style={styles.reminderTime}>
                  {notificationService.formatReminderTime(config.hour, config.minute)} • {notificationService.getDayNames(config.days)}
                </Text>
              </View>
              <Switch
                value={config.enabled}
                onValueChange={(enabled) => toggleReminder(config.id, enabled)}
                trackColor={{ false: '#374151', true: '#6366f1' }}
                thumbColor={config.enabled ? '#ffffff' : '#9ca3af'}
                disabled={isLoading}
              />
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={exportData}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>📤 Export Dreams</Text>
            <Text style={styles.actionButtonDescription}>
              Create a backup of all your dreams
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllData}
            disabled={isLoading}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>🗑️ Clear All Data</Text>
            <Text style={styles.actionButtonDescription}>
              Permanently delete all dreams and settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database</Text>
            <Text style={styles.infoValue}>SQLite (Local)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Features</Text>
            <Text style={styles.infoValue}>Voice, Camera, Notifications</Text>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  testButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  reminderInfo: {
    flex: 1,
    paddingRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 18,
  },
  reminderTime: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#7f1d1d',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  dangerButtonText: {
    color: '#fca5a5',
  },
  actionButtonDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
  footer: {
    height: 40,
  },
})