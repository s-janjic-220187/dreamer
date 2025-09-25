import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { HomeScreen } from './screens/HomeScreen'
import { DreamFormScreen } from './screens/DreamFormScreen'
import { DreamDetailScreen } from './screens/DreamDetailScreenWrapper'
import { SettingsScreen } from './screens/SettingsScreen'

export type RootStackParamList = {
  Home: undefined
  DreamForm: { dreamId?: string }
  DreamDetail: { dreamId: string }
  Settings: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DreamForm" component={DreamFormScreen} />
        <Stack.Screen name="DreamDetail" component={DreamDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}