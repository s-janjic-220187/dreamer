import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Dream } from '../services/api';
import { api } from '../services/api';

// Store state interface
interface DreamStore {
  // State
  dreams: Dream[];
  currentDream: Dream | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDreams: (dreams: Dream[]) => void;
  setCurrentDream: (dream: Dream | null) => void;
  
  // Async actions
  fetchDreams: () => Promise<void>;
  fetchDreamById: (id: string) => Promise<void>;
  createDream: (dreamData: {
    title: string;
    content: string;
    mood: 'positive' | 'negative' | 'neutral' | 'mixed';
    tags: string[];
  }) => Promise<Dream | null>;
  updateDream: (id: string, dreamData: Partial<{
    title: string;
    content: string;
    mood: 'positive' | 'negative' | 'neutral' | 'mixed';
    tags: string[];
  }>) => Promise<Dream | null>;
  deleteDream: (id: string) => Promise<void>;
}

export const useDreamStore = create<DreamStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      dreams: [],
      currentDream: null,
      isLoading: false,
      error: null,

      // Synchronous actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setDreams: (dreams) => set({ dreams }),
      setCurrentDream: (dream) => set({ currentDream: dream }),

      // Async actions
      fetchDreams: async () => {
        try {
          set({ isLoading: true, error: null });
          const dreams = await api.dreams.getDreams();
          set({ dreams, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dreams';
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchDreamById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const dream = await api.dreams.getDreamById(id);
          set({ currentDream: dream, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dream';
          set({ error: errorMessage, isLoading: false, currentDream: null });
        }
      },

      createDream: async (dreamData) => {
        try {
          set({ isLoading: true, error: null });
          const newDream = await api.dreams.createDream(dreamData);
          
          // Add the new dream to the list
          const { dreams } = get();
          set({ 
            dreams: [newDream, ...dreams], 
            currentDream: newDream, 
            isLoading: false 
          });
          
          return newDream;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create dream';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      updateDream: async (id: string, dreamData) => {
        try {
          set({ isLoading: true, error: null });
          const updatedDream = await api.dreams.updateDream(id, dreamData);
          
          // Update the dream in the list
          const { dreams, currentDream } = get();
          const updatedDreams = dreams.map(dream => 
            dream.id === id ? updatedDream : dream
          );
          
          set({ 
            dreams: updatedDreams,
            currentDream: currentDream?.id === id ? updatedDream : currentDream,
            isLoading: false 
          });
          
          return updatedDream;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update dream';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      deleteDream: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.dreams.deleteDream(id);
          
          // Remove the dream from the list
          const { dreams, currentDream } = get();
          const filteredDreams = dreams.filter(dream => dream.id !== id);
          
          set({ 
            dreams: filteredDreams,
            currentDream: currentDream?.id === id ? null : currentDream,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete dream';
          set({ error: errorMessage, isLoading: false });
        }
      },
    }),
    {
      name: 'dream-store', // Store name for devtools
    }
  )
);

// Selector hooks for common operations
export const useLoading = () => useDreamStore((state) => state.isLoading);
export const useError = () => useDreamStore((state) => state.error);
export const useDreams = () => useDreamStore((state) => state.dreams);
export const useCurrentDream = () => useDreamStore((state) => state.currentDream);