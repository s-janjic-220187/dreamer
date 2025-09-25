// Temporary types for web app until shared types are properly imported
export interface Dream {
  id: string
  title: string
  content: string
  date: string
  mood: 'positive' | 'negative' | 'neutral' | 'mixed'
  tags: string[]
  audioPath?: string
  createdAt: string
  updatedAt: string
}