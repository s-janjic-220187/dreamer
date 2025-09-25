import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export interface DreamReminderConfig {
  id: string
  title: string
  body: string
  hour: number // 0-23
  minute: number // 0-59
  days: number[] // 0=Sunday, 1=Monday, etc.
  enabled: boolean
}

class NotificationService {
  private isInitialized = false
  private expoPushToken: string | null = null

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        console.warn('Notification permissions not granted')
        return
      }

      // Only get push token on physical devices
      this.expoPushToken = await this.getExpoPushToken()

      this.isInitialized = true
      console.log('Notification service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize notification service:', error)
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('dream-reminders', {
        name: 'Dream Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        enableVibrate: true,
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    return finalStatus === 'granted'
  }

  private async getExpoPushToken(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      })).data
      
      console.log('Expo Push Token:', token)
      return token
    } catch (error) {
      console.error('Failed to get push token:', error)
      return null
    }
  }

  // Schedule a dream reminder notification
  async scheduleDreamReminder(config: DreamReminderConfig): Promise<string> {
    await this.ensureInitialized()

    // Use weekly trigger for repeating notifications
    const trigger: Notifications.WeeklyTriggerInput = {
      weekday: config.days.length === 1 ? config.days[0] + 1 : 2, // Default to Monday if multiple days
      hour: config.hour,
      minute: config.minute,
      repeats: true,
    }

    // If multiple days, schedule separate notifications
    if (config.days.length > 1) {
      const notificationIds: string[] = []
      
      for (const day of config.days) {
        const dayTrigger: Notifications.WeeklyTriggerInput = {
          weekday: day + 1, // Convert to 1-7 format (1=Monday in Expo)
          hour: config.hour,
          minute: config.minute,
          repeats: true,
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: config.title,
            body: config.body,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'dream-reminder',
            data: { type: 'dream-reminder', configId: config.id },
          },
          trigger: dayTrigger,
        })

        notificationIds.push(notificationId)
      }

      return notificationIds[0] // Return first ID as primary
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'dream-reminder',
        data: { type: 'dream-reminder', configId: config.id },
      },
      trigger,
    })
  }

  // Cancel a scheduled reminder
  async cancelDreamReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      console.error('Failed to cancel notification:', error)
    }
  }

  // Cancel all dream reminders
  async cancelAllDreamReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Failed to cancel all notifications:', error)
    }
  }

  // Get all scheduled notifications
  async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error)
      return []
    }
  }

  // Send immediate dream reminder
  async sendImmediateDreamReminder(title: string, body: string): Promise<string> {
    await this.ensureInitialized()

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'dream-reminder',
        data: { type: 'immediate-reminder' },
      },
      trigger: null, // Immediate notification
    })
  }

  // Preset reminder configurations
  getPresetReminders(): DreamReminderConfig[] {
    return [
      {
        id: 'morning-recall',
        title: '🌅 Morning Dream Recall',
        body: 'Good morning! Take a moment to remember and record your dreams from last night.',
        hour: 7,
        minute: 0,
        days: [1, 2, 3, 4, 5, 6, 7], // Every day
        enabled: true,
      },
      {
        id: 'bedtime-intention',
        title: '🌙 Set Dream Intention',
        body: 'Before you sleep, set an intention for tonight\'s dreams. What would you like to explore?',
        hour: 22,
        minute: 0,
        days: [1, 2, 3, 4, 5, 6, 7], // Every day
        enabled: false,
      },
      {
        id: 'lucid-reality-check',
        title: '✨ Reality Check Reminder',
        body: 'Pause and ask: "Am I dreaming?" Check your hands and surroundings mindfully.',
        hour: 12,
        minute: 0,
        days: [1, 2, 3, 4, 5, 6, 7], // Every day
        enabled: false,
      },
      {
        id: 'weekend-dream-review',
        title: '📚 Weekly Dream Review',
        body: 'Take some time to review this week\'s dreams. Notice any patterns or themes.',
        hour: 10,
        minute: 0,
        days: [0], // Sunday only
        enabled: false,
      },
      {
        id: 'meditation-reminder',
        title: '🧘 Dream Meditation',
        body: 'Take 5 minutes for dream-focused meditation to enhance your dream recall.',
        hour: 20,
        minute: 30,
        days: [1, 3, 5], // Monday, Wednesday, Friday
        enabled: false,
      }
    ]
  }

  // Schedule multiple preset reminders
  async schedulePresetReminders(presets: DreamReminderConfig[]): Promise<{ [key: string]: string }> {
    const notificationIds: { [key: string]: string } = {}

    for (const preset of presets) {
      if (preset.enabled) {
        try {
          const notificationId = await this.scheduleDreamReminder(preset)
          notificationIds[preset.id] = notificationId
        } catch (error) {
          console.error(`Failed to schedule ${preset.id}:`, error)
        }
      }
    }

    return notificationIds
  }

  // Handle notification responses (when user taps notification)
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback)
  }

  // Handle notifications when app is in foreground
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback)
  }

  // Smart reminder suggestions based on user behavior
  async suggestOptimalReminderTimes(): Promise<{ morning: number; evening: number }> {
    // This could be enhanced with actual user data analysis
    // For now, return common optimal times
    return {
      morning: 7, // 7 AM - typical wake-up time
      evening: 22, // 10 PM - typical bedtime preparation
    }
  }

  // Utility method to format time for display
  formatReminderTime(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const displayMinute = minute.toString().padStart(2, '0')
    return `${displayHour}:${displayMinute} ${period}`
  }

  // Get day names for display
  getDayNames(days: number[]): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    if (days.length === 7) return 'Every day'
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays'
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends'
    
    return days.map(d => dayNames[d]).join(', ')
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// Notification categories for interactive notifications
export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync('dream-reminder', [
    {
      identifier: 'record-dream',
      buttonTitle: 'Record Dream',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Remind Later',
      options: { opensAppToForeground: false },
    },
  ])
}