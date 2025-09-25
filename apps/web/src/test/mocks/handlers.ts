import { http, HttpResponse } from 'msw'
import type { Dream } from '../../types'

const mockDreams: Dream[] = [
  {
    id: '1',
    title: 'Flying Dream',
    content: 'I was flying over mountains, feeling incredibly free and peaceful.',
    date: new Date('2025-09-24T10:00:00.000Z').toISOString(),
    mood: 'positive',
    tags: ['flying', 'mountains', 'freedom'],
    createdAt: new Date('2025-09-24T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-09-24T10:00:00.000Z').toISOString()
  },
  {
    id: '2', 
    title: 'Ocean Dream',
    content: 'Swimming in clear blue waters under a bright sun.',
    date: new Date('2025-09-23T14:30:00.000Z').toISOString(),
    mood: 'positive',
    tags: ['water', 'ocean', 'swimming'],
    createdAt: new Date('2025-09-23T14:30:00.000Z').toISOString(),
    updatedAt: new Date('2025-09-23T14:30:00.000Z').toISOString()
  }
]

export const handlers = [
  // Health check
  http.get('/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    })
  }),

  // Get dreams
  http.get('/api/v1/dreams', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20
    const offset = Number(url.searchParams.get('offset')) || 0
    const query = url.searchParams.get('query')

    let filteredDreams = [...mockDreams]
    
    // Apply search filter
    if (query) {
      filteredDreams = mockDreams.filter(dream => 
        dream.title.toLowerCase().includes(query.toLowerCase()) ||
        dream.content.toLowerCase().includes(query.toLowerCase()) ||
        dream.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }

    const paginatedDreams = filteredDreams.slice(offset, offset + limit)

    return HttpResponse.json({
      success: true,
      data: {
        dreams: paginatedDreams,
        total: filteredDreams.length,
        hasMore: offset + limit < filteredDreams.length
      },
      timestamp: new Date().toISOString()
    })
  }),

  // Create dream
  http.post('/api/v1/dreams', async ({ request }) => {
    const dreamData = await request.json() as Partial<Dream>
    
    // Validate required fields
    if (!dreamData.title || !dreamData.content) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const newDream: Dream = {
      id: `dream-${Date.now()}`,
      title: dreamData.title,
      content: dreamData.content,
      date: dreamData.date || new Date().toISOString(),
      mood: dreamData.mood || 'neutral',
      tags: dreamData.tags || [],
      audioPath: dreamData.audioPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to mock data
    mockDreams.unshift(newDream)

    return HttpResponse.json({
      success: true,
      data: newDream,
      timestamp: new Date().toISOString()
    }, { status: 201 })
  }),

  // Get dream by ID
  http.get('/api/v1/dreams/:id', ({ params }) => {
    const dream = mockDreams.find(d => d.id === params.id)
    if (!dream) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'DREAM_NOT_FOUND',
          message: 'Dream not found'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: dream,
      timestamp: new Date().toISOString()
    })
  }),

  // Update dream
  http.put('/api/v1/dreams/:id', async ({ params, request }) => {
    const updates = await request.json() as Partial<Dream>
    const dreamIndex = mockDreams.findIndex(d => d.id === params.id)
    
    if (dreamIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'DREAM_NOT_FOUND',
          message: 'Dream not found'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    const updatedDream = {
      ...mockDreams[dreamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    mockDreams[dreamIndex] = updatedDream

    return HttpResponse.json({
      success: true,
      data: updatedDream,
      timestamp: new Date().toISOString()
    })
  }),

  // Delete dream
  http.delete('/api/v1/dreams/:id', ({ params }) => {
    const dreamIndex = mockDreams.findIndex(d => d.id === params.id)
    if (dreamIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'DREAM_NOT_FOUND',
          message: 'Dream not found'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    mockDreams.splice(dreamIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Analyze dream
  http.post('/api/v1/dreams/:id/analyze', ({ params }) => {
    const dream = mockDreams.find(d => d.id === params.id)
    if (!dream) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'DREAM_NOT_FOUND',
          message: 'Dream not found'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Mock analysis response
    const mockAnalysis = {
      id: `analysis-${Date.now()}`,
      dreamId: dream.id,
      interpretation: 'This dream suggests a desire for freedom and transcendence. Flying often represents liberation from constraints and a higher perspective on life.',
      symbols: [
        { name: 'flying', meaning: 'Freedom, transcendence, liberation', confidence: 0.9 },
        { name: 'mountains', meaning: 'Challenges, obstacles, higher goals', confidence: 0.8 }
      ],
      themes: ['freedom', 'transcendence', 'personal growth'],
      confidence: 0.85,
      generatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: mockAnalysis,
      timestamp: new Date().toISOString()
    })
  }),

  // AI Analyze endpoint
  http.post('/api/v1/ai/analyze', async ({ request }) => {
    await request.json()
    
    // Mock AI analysis response
    const mockAnalysis = {
      id: `analysis-${Date.now()}`,
      dreamId: 'test-dream',
      interpretation: 'This dream reveals themes of personal transformation and emotional growth. The symbolic elements suggest a journey of self-discovery.',
      symbols: [
        { 
          symbol: 'water', 
          meaning: 'Emotions, purification, life force', 
          confidence: 0.88 
        },
        { 
          symbol: 'flight', 
          meaning: 'Freedom, transcendence, escape from limitations', 
          confidence: 0.92 
        }
      ],
      themes: ['transformation', 'emotional growth', 'self-discovery'],
      emotions: [
        { emotion: 'joy', intensity: 0.8 },
        { emotion: 'excitement', intensity: 0.7 }
      ],
      patterns: ['transformation', 'spiritual growth'],
      suggestions: ['Keep a dream journal', 'Practice meditation'],
      createdAt: new Date().toISOString()
    }

    return HttpResponse.json(mockAnalysis)
  }),

  // AI Patterns endpoint
  http.post('/api/v1/ai/patterns', async ({ request }) => {
    await request.json()
    
    // Mock patterns analysis response
    const mockPatterns = [
      {
        type: 'pattern',
        title: 'Water Elements',
        description: 'Water appears frequently in your dreams, often representing emotional states and purification.',
        confidence: 0.65,
        relatedDreams: ['1', '2']
      },
      {
        type: 'symbol',
        title: 'Freedom Seeking',
        description: 'A consistent theme of seeking freedom and breaking from constraints.',
        confidence: 0.45,
        relatedDreams: ['1']
      }
    ]

    return HttpResponse.json(mockPatterns)
  }),

  // AI Prompts endpoint
  http.get('/api/v1/ai/prompts', ({ request }) => {
    const url = new URL(request.url)
    const count = url.searchParams.get('count') || '3'
    
    // Mock prompts response
    const mockPrompts = [
      'What emotions did you feel most strongly in this dream?',
      'Were there any familiar people or places in your dream?',
      'What was the overall atmosphere or mood of the dream?'
    ]

    return HttpResponse.json({
      prompts: mockPrompts.slice(0, parseInt(count))
    })
  })
]