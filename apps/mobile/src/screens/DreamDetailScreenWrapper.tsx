import React from 'react'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { DreamDetail } from './DreamDetailScreen'
import { RootStackParamList } from '../Navigation'

type DreamDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DreamDetail'>
type DreamDetailScreenRouteProp = RouteProp<RootStackParamList, 'DreamDetail'>

export interface DreamDetailScreenWrapperProps {
  navigation: DreamDetailScreenNavigationProp
  route: DreamDetailScreenRouteProp
}

export const DreamDetailScreen: React.FC<DreamDetailScreenWrapperProps> = ({ 
  navigation, 
  route 
}) => {
  const { dreamId } = route.params

  const handleEdit = (editDreamId: string) => {
    navigation.navigate('DreamForm', { dreamId: editDreamId })
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <DreamDetail
      dreamId={dreamId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}