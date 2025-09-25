import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Navigation from './src/Navigation'

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Navigation />
      <StatusBar style="light" backgroundColor="#1a1a2e" />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
})
