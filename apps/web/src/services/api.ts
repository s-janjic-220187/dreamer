// Types
export interface Dream {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  analysis?: {
    id: string;
    dreamId: string;
    interpretation: string;
    symbols: Array<{
      symbol: string;
      meaning: string;
      confidence: number;
    }>;
    themes: string[];
    emotions: string[];
    confidence: number;
    generatedAt: Date;
    modelUsed: string;
  };
  audioPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API request types
export interface CreateDreamRequest {
  title: string;
  content: string;
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  tags: string[];
  date?: Date;
}

export interface UpdateDreamRequest {
  title?: string;
  content?: string;
  mood?: 'positive' | 'negative' | 'neutral' | 'mixed';
  tags?: string[];
  date?: Date;
}

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Generic API error class
export class ApiError extends Error {
  public status: number;
  public response?: any;

  constructor(
    message: string,
    status: number,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      
      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

// Dreams API
export const dreamsApi = {
  // Get all dreams
  async getDreams(): Promise<Dream[]> {
    const response = await apiRequest<any>('/dreams');
    // Handle wrapped response format from API
    if (response && response.data && Array.isArray(response.data.dreams)) {
      return response.data.dreams;
    }
    // Handle direct array response
    if (Array.isArray(response)) {
      return response;
    }
    // Handle wrapped array
    if (response && Array.isArray(response.dreams)) {
      return response.dreams;
    }
    // Fallback to empty array
    console.warn('Unexpected API response format:', response);
    return [];
  },

  // Get dream by ID
  async getDreamById(id: string): Promise<Dream> {
    return apiRequest<Dream>(`/dreams/${id}`);
  },

  // Create new dream
  async createDream(dream: CreateDreamRequest): Promise<Dream> {
    return apiRequest<Dream>('/dreams', {
      method: 'POST',
      body: JSON.stringify(dream),
    });
  },

  // Update dream
  async updateDream(id: string, dream: UpdateDreamRequest): Promise<Dream> {
    return apiRequest<Dream>(`/dreams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dream),
    });
  },

  // Delete dream
  async deleteDream(id: string): Promise<void> {
    return apiRequest<void>(`/dreams/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthApi = {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return apiRequest<{ status: string; timestamp: string }>('/health');
  },
};

// Export API instance for easy importing
export const api = {
  dreams: dreamsApi,
  health: healthApi,
};