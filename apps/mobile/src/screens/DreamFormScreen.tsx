import React from 'react'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { DreamForm } from '../components/DreamForm'
import { RootStackParamList } from '../Navigation'
import { Dream } from '../stores/dreamStore'

type DreamFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DreamForm'>
type DreamFormScreenRouteProp = RouteProp<RootStackParamList, 'DreamForm'>

export interface DreamFormScreenProps {
  navigation: DreamFormScreenNavigationProp
  route: DreamFormScreenRouteProp
}

export const DreamFormScreen: React.FC<DreamFormScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { dreamId } = route.params || {}

  const handleSave = (dream: Dream) => {
    // Navigate back to home or to the dream detail
    if (dreamId) {
      // If editing, go to dream detail
      navigation.replace('DreamDetail', { dreamId: dream.id })
    } else {
      // If creating new, go to dream detail
      navigation.replace('DreamDetail', { dreamId: dream.id })
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  return (
    <DreamForm
      dreamId={dreamId}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}