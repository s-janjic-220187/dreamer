export interface Dream {
  id: string
  title: string
  content: string
  mood?: 'wonderful' | 'good' | 'okay' | 'bad' | 'nightmare'
  tags: string[]
  isLucid: boolean
  sleepQuality?: number // 1-5 rating
  createdAt: Date
  updatedAt: Date
}

export interface DreamImage {
  id: string
  dreamId: string
  imageUri: string
  caption?: string
  createdAt: Date
}

export interface DreamTag {
  name: string
  count: number
}

export interface DreamSearchFilters {
  mood?: Dream['mood']
  isLucid?: boolean
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  sleepQuality?: {
    min?: number
    max?: number
  }
}

export interface DreamStats {
  totalDreams: number
  lucidDreams: number
  averageSleepQuality: number
  mostCommonMood: Dream['mood']
  topTags: DreamTag[]
  dreamsThisWeek: number
  dreamsThisMonth: number
}