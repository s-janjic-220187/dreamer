import React, { useMemo } from 'react';
import { useDreamStore } from '../stores/dreamStore';

const categoryColors: Record<string, string> = {
  'Lucid Dreams': '#4CAF50',
  'Nightmares': '#F44336',
  'Recurring Dreams': '#FF9800',
  'Flying Dreams': '#2196F3',
  'Chase Dreams': '#9C27B0',
  'Falling Dreams': '#795548',
  'Water Dreams': '#00BCD4',
  'Animal Dreams': '#8BC34A',
  'Death Dreams': '#607D8B',
  'Prophetic Dreams': '#E91E63'
};

const moodColors: Record<number, string> = {
  1: '#F44336', 2: '#FF5722', 3: '#FF9800', 4: '#FFC107', 5: '#FFEB3B',
  6: '#CDDC39', 7: '#8BC34A', 8: '#4CAF50', 9: '#009688', 10: '#2196F3'
};

// Simple categorization function - in a real app this would use the AI service
const categorizeDream = (dream: any): string => {
  const content = (dream.content || '').toLowerCase();
  if (content.includes('fly') || content.includes('flying')) return 'Flying Dreams';
  if (content.includes('chase') || content.includes('running')) return 'Chase Dreams';
  if (content.includes('water') || content.includes('ocean')) return 'Water Dreams';
  if (content.includes('fall') || content.includes('falling')) return 'Falling Dreams';
  if (content.includes('animal') || content.includes('dog')) return 'Animal Dreams';
  if (content.includes('nightmare') || content.includes('scary')) return 'Nightmares';
  if (content.includes('lucid') || content.includes('control')) return 'Lucid Dreams';
  return 'Recurring Dreams';
};

export const DreamVisualizationCharts: React.FC = () => {
  const { dreams } = useDreamStore();

  const chartData = useMemo(() => {
    if (dreams.length === 0) return [];

    const groupedData = dreams.reduce((acc, dream) => {
      const date = new Date(dream.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { dreams: [], totalMood: 0, categories: {} };
      }
      
      acc[date].dreams.push(dream);
      acc[date].totalMood += dream.mood || 5;
      
      const category = categorizeDream(dream);
      acc[date].categories[category] = (acc[date].categories[category] || 0) + 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(groupedData)
      .map(([date, data]) => ({
        date,
        count: data.dreams.length,
        avgMood: data.totalMood / data.dreams.length,
        categories: data.categories
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [dreams]);

  const categoryStats = useMemo(() => {
    const totalDreams = dreams.length;
    if (totalDreams === 0) return [];

    const categoryCount: Record<string, number> = {};
    
    dreams.forEach(dream => {
      const category = categorizeDream(dream);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalDreams) * 100,
        color: categoryColors[category] || '#9E9E9E'
      }))
      .sort((a, b) => b.count - a.count);
  }, [dreams]);

  const moodTrends = useMemo(() => {
    if (dreams.length === 0) return [];
    
    return dreams
      .filter(dream => {
        const dreamDate = new Date(dream.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return dreamDate >= weekAgo;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(dream => ({
        date: new Date(dream.createdAt).toLocaleDateString(),
        mood: dream.mood || 5,
        title: dream.title
      }));
  }, [dreams]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  
  // Calculate average mood safely
  const totalMoodSum = dreams.reduce((sum: number, dream) => {
    let moodValue = 5; // default
    if (typeof dream.mood === 'string') {
      moodValue = dream.mood === 'positive' ? 8 : dream.mood === 'negative' ? 3 : 5;
    } else if (typeof dream.mood === 'number') {
      moodValue = dream.mood;
    }
    return sum + moodValue;
  }, 0);
  const avgMood = dreams.length > 0 ? totalMoodSum / dreams.length : 0;

  if (dreams.length === 0) {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        textAlign: 'center' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>Dream Visualization</h3>
        <p style={{ color: '#6c757d' }}>Start recording dreams to see your patterns and insights</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dream Activity Chart */}
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>Dream Activity (Last 30 Days)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chartData.map((data) => (
            <div key={data.date} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <span style={{ 
                fontSize: '14px', 
                minWidth: '80px', 
                color: '#6c757d' 
              }}>
                {data.date}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: `${(data.count / maxCount) * 100}%`,
                    height: '20px',
                    backgroundColor: '#2196F3',
                    borderRadius: '10px',
                    minWidth: '2px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', color: '#6c757d', minWidth: '80px' }}>
                  {data.count} dream{data.count !== 1 ? 's' : ''}
                </span>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: moodColors[Math.round(data.avgMood)] || '#9E9E9E'
                  }}
                  title={`Avg mood: ${data.avgMood.toFixed(1)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>Dream Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categoryStats.map((stat) => (
            <div key={stat.category} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: stat.color
              }} />
              <span style={{ flex: 1, fontSize: '16px' }}>
                {stat.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: `${stat.percentage * 2}px`,
                  height: '8px',
                  backgroundColor: stat.color,
                  borderRadius: '4px',
                  minWidth: '4px'
                }} />
                <span style={{ fontSize: '14px', color: '#6c757d', minWidth: '80px' }}>
                  {stat.count} ({stat.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Trends */}
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>Recent Mood Trends</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {moodTrends.length > 0 ? moodTrends.map((trend, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <span style={{ fontSize: '14px', minWidth: '80px', color: '#6c757d' }}>
                {trend.date}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: moodColors[Number(trend.mood)] || '#9E9E9E'
                }} />
                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                  Mood: {trend.mood}/10
                </span>
                <span style={{ fontSize: '14px', flex: 1 }}>
                  {trend.title}
                </span>
              </div>
            </div>
          )) : (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>
              No dreams recorded in the last 7 days
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>AI Pattern Summary</h3>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '8px' }}>Total Dreams</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
              {dreams.length}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '8px' }}>Avg Mood</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
              {avgMood.toFixed(1)}/10
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '8px' }}>Most Common</h4>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9C27B0' }}>
              {categoryStats[0]?.category || 'None'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};