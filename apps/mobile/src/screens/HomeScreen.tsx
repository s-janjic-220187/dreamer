import React, { useEffect } from 'react'
import { View, Text, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationProp } from '@react-navigation/stack'
import { useDreamStore } from '../stores/dreamStore'
import { DreamList } from '../components/DreamList'
import { RootStackParamList } from '../Navigation'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { 
    dreams, 
    isLoading, 
    error, 
    fetchDreams, 
    clearError,
    getFilteredDreams 
  } = useDreamStore()

  useEffect(() => {
    fetchDreams()
  }, [fetchDreams])

  const handleDreamPress = (dreamId: string) => {
    navigation.navigate('DreamDetail', { dreamId })
  }

  const handleAddDreamPress = () => {
    navigation.navigate('DreamForm', {})
  }

  const handleSettingsPress = () => {
    navigation.navigate('Settings')
  }

  const handleRefresh = () => {
    clearError()
    fetchDreams()
  }

  const filteredDreams = getFilteredDreams()

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <DreamList
          dreams={filteredDreams}
          onDreamPress={handleDreamPress}
          onAddDreamPress={handleAddDreamPress}
          onSettingsPress={handleSettingsPress}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
})