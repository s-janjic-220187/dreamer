import { useState, useEffect } from 'react'
import type { DreamCategory } from '../services/enhancedAI'
import { enhancedAIService } from '../services/enhancedAI'
import type { Dream } from '../types'

interface EnhancedDreamDashboardProps {
  dreams: Dream[]
  onCategoryFilter?: (category: DreamCategory | null) => void
}

export function EnhancedDreamDashboard({ dreams, onCategoryFilter }: EnhancedDreamDashboardProps) {
  const [dreamAnalytics, setDreamAnalytics] = useState<any>(null)
  
  useEffect(() => {
    const analyzeDreams = async () => {
      if (dreams.length === 0) return
      
      try {
        // Convert dream dates to proper format for analysis
        const formattedDreams = dreams.map(dream => ({
          id: dream.id,
          content: dream.content,
          date: new Date(dream.date),
          mood: dream.mood,
          tags: dream.tags
        }))
        
        const analytics = await enhancedAIService.analyzePatterns(formattedDreams)
        setDreamAnalytics(analytics)
      } catch (error) {
        console.error('Error analyzing dreams:', error)
      }
    }
    
    analyzeDreams()
  }, [dreams])

  const icons: Record<DreamCategory, string> = {
    lucid: '🌙',
    nightmare: '😰',
    prophetic: '🔮',
    symbolic: '🎭',
    recurring: '🔄',
    emotional: '❤️',
    adventure: '🚀',
    relationship: '👥',
    work_stress: '💼',
    healing: '🌿',
    psychological: '🧠',
    wish_fulfillment: '⭐',
    problem_solving: '🔍',
    memory_processing: '💭',
    creative: '🎨',
    emotional_release: '💥',
    spiritual: '✨'
  }

  if (!dreamAnalytics) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Analyzing your dreams...</h3>
        <p style={{ color: '#666' }}>
          Discovering patterns and insights in your dream journal...
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Dream Analytics</h2>
        <p style={{ color: '#666' }}>
          Based on analysis of {dreams.length} dreams
        </p>
      </div>

      {dreamAnalytics.patterns && dreamAnalytics.patterns.length > 0 && (
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Discovered Patterns</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dreamAnalytics.patterns.slice(0, 6).map((pattern: any, index: number) => (
              <button
                key={index}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => onCategoryFilter?.(pattern.type)}
              >
                {icons[pattern.type as DreamCategory] || '🌟'} {pattern.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Quick Stats</h3>
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0', color: '#333' }}>{dreams.length}</h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>Total Dreams</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0', color: '#007bff' }}>
              {Math.round((dreamAnalytics.lucidPercentage || 0) * 100)}%
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>Lucid Rate</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0', color: '#28a745' }}>
              {dreamAnalytics.averageMood || 'N/A'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>Avg Mood</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDreamDashboard