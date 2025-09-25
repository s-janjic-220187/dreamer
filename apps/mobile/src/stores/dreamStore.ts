import { create } from 'zustand'
import { databaseService } from '../services/database'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// Simplified types for initial mobile development
export interface Dream {
  id: string
  title: string
  content: string
  mood: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDreamRequest {
  title: string
  content: string
  mood: string
  tags: string[]
}

export interface UpdateDreamRequest {
  title?: string
  content?: string
  mood?: string
  tags?: string[]
}

interface DreamState {
  dreams: Dream[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedMood: string | null
}

interface DreamActions {
  // Core CRUD operations
  fetchDreams: () => Promise<void>
  createDream: (dream: CreateDreamRequest) => Promise<Dream>
  updateDream: (id: string, dream: UpdateDreamRequest) => Promise<Dream>
  deleteDream: (id: string) => Promise<void>
  getDream: (id: string) => Dream | undefined
  
  // Search and filtering
  setSearchQuery: (query: string) => void
  setSelectedMood: (mood: string | null) => void
  getFilteredDreams: () => Dream[]
  
  // Sync operations
  syncWithServer: () => Promise<void>
  markDreamForSync: (id: string) => void
  
  // Utility
  clearError: () => void
  reset: () => void
}

type DreamStore = DreamState & DreamActions

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api/v1'
  : 'https://your-production-api.com/api/v1'

const initialState: DreamState = {
  dreams: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedMood: null
}

export const useDreamStore = create<DreamStore>()((set, get) => ({
  ...initialState,

  // Core CRUD operations (simplified for mobile)
  fetchDreams: async () => {
    set({ isLoading: true, error: null })
    try {
      // Initialize database first
      await databaseService.initialize()
      
      // Fetch dreams from SQLite database
      const dbDreams = await databaseService.getAllDreams()
      
      // Convert database dreams to store format
      const dreams: Dream[] = dbDreams.map(dream => ({
        id: dream.id,
        title: dream.title,
        content: dream.content,
        mood: dream.mood || 'neutral',
        tags: dream.tags,
        createdAt: dream.createdAt.toISOString(),
        updatedAt: dream.updatedAt.toISOString()
      }))
      
      set({ dreams, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch dreams from database:', error)
      
      // Fallback to mock data if database fails
      const mockDreams: Dream[] = [
        {
          id: '1',
          title: 'Flying Over Mountains',
          content: 'I was soaring high above snow-capped mountains, feeling incredibly free and peaceful.',
          mood: 'positive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['flying', 'mountains', 'freedom']
        },
        {
          id: '2',
          title: 'Lost in a Maze',
          content: 'I found myself trapped in an endless maze with walls that kept shifting.',
          mood: 'anxious',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['maze', 'lost', 'confusion']
        }
      ]
      
      set({ dreams: mockDreams, error: 'Using offline mode', isLoading: false })
    }
  },

  createDream: async (dreamData: CreateDreamRequest) => {
    set({ isLoading: true, error: null })
    try {
      // Create dream in database
      const dbDream = await databaseService.createDream({
        title: dreamData.title,
        content: dreamData.content,
        mood: dreamData.mood as any,
        tags: dreamData.tags,
        isLucid: false,
        sleepQuality: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      const newDream: Dream = {
        id: dbDream.id,
        title: dbDream.title,
        content: dbDream.content,
        mood: dbDream.mood || 'neutral',
        tags: dbDream.tags,
        createdAt: dbDream.createdAt.toISOString(),
        updatedAt: dbDream.updatedAt.toISOString()
      }
      
      set((state: any) => ({ 
        dreams: [newDream, ...state.dreams],
        isLoading: false 
      }))
      
      return newDream
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateDream: async (id: string, dreamData: UpdateDreamRequest) => {
    set({ isLoading: true, error: null })
    try {
      set((state: any) => ({
        dreams: state.dreams.map((dream: Dream) => 
          dream.id === id 
            ? { ...dream, ...dreamData, updatedAt: new Date().toISOString() }
            : dream
        ),
        isLoading: false
      }))
      
      return get().dreams.find((dream: Dream) => dream.id === id)!
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteDream: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      set((state: any) => ({
        dreams: state.dreams.filter((dream: Dream) => dream.id !== id),
        isLoading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  getDream: (id: string) => {
    return get().dreams.find((dream: Dream) => dream.id === id)
  },

  // Search and filtering
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setSelectedMood: (mood: string | null) => {
    set({ selectedMood: mood })
  },

  getFilteredDreams: () => {
    const { dreams, searchQuery, selectedMood } = get()
    return dreams.filter((dream: Dream) => {
      const matchesSearch = !searchQuery || 
        dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesMood = !selectedMood || dream.mood === selectedMood
      
      return matchesSearch && matchesMood
    })
  },

  // Utility
  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  },

  // Sync operations (placeholder for future server integration)
  syncWithServer: async () => {
    console.log('Sync with server - not implemented yet')
  },

  markDreamForSync: (id: string) => {
    console.log('Mark dream for sync - not implemented yet', id)
  }
}))

// Convenience hooks
export const useDreams = () => useDreamStore((state) => state.dreams)
export const useDreamActions = () => useDreamStore((state) => ({
  fetchDreams: state.fetchDreams,
  createDream: state.createDream,
  updateDream: state.updateDream,
  deleteDream: state.deleteDream,
  getDream: state.getDream,
  setSearchQuery: state.setSearchQuery,
  setSelectedMood: state.setSelectedMood,
  getFilteredDreams: state.getFilteredDreams,
  clearError: state.clearError,
  reset: state.reset
}))
export const useDreamLoading = () => useDreamStore((state) => state.isLoading)
export const useDreamError = () => useDreamStore((state) => state.error)