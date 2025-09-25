import React, { useState, useEffect, useMemo } from 'react';
import { YStack, XStack } from '@tamagui/stacks';
import { H3, H4, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { Separator } from '@tamagui/separator';

import { useDreams } from '../stores/dreamStore';
import type { Dream } from '../services/api';

interface SearchFilters {
  query: string;
  mood: 'all' | 'positive' | 'negative' | 'neutral' | 'mixed';
  dateRange: 'all' | 'week' | 'month' | '3months' | 'year';
  tags: string[];
  minLength: number;
  sortBy: 'date' | 'relevance' | 'length';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  dream: Dream;
  relevanceScore: number;
  matchedFields: string[];
  highlights: {
    title: string;
    content: string;
  };
}

export const AdvancedDreamSearch: React.FC = () => {
  const dreams = useDreams();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    mood: 'all',
    dateRange: 'all',
    tags: [],
    minLength: 0,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Natural Language Processing for search
  const processSearchQuery = (query: string): {
    keywords: string[];
    emotions: string[];
    concepts: string[];
    negations: string[];
  } => {
    const lowerQuery = query.toLowerCase();
    
    // Extract keywords (remove stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'me', 'my', 'was', 'is', 'are', 'have', 'had'];
    const keywords = lowerQuery
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Extract emotional keywords
    const emotionalWords = ['happy', 'sad', 'scared', 'angry', 'excited', 'worried', 'calm', 'anxious', 'peaceful', 'terrified', 'joyful', 'depressed'];
    const emotions = keywords.filter(word => 
      emotionalWords.some(emotion => word.includes(emotion) || emotion.includes(word))
    );
    
    // Extract conceptual keywords
    const conceptWords = ['flying', 'falling', 'water', 'fire', 'family', 'friends', 'work', 'school', 'house', 'car', 'animal', 'death', 'birth'];
    const concepts = keywords.filter(word =>
      conceptWords.some(concept => word.includes(concept) || concept.includes(word))
    );
    
    // Extract negations
    const negationWords = lowerQuery.match(/not\s+\w+|no\s+\w+|never\s+\w+|without\s+\w+/g) || [];
    const negations = negationWords.map(phrase => phrase.split(/\s+/)[1]);
    
    return { keywords, emotions, concepts, negations };
  };

  // Calculate relevance score for a dream
  const calculateRelevanceScore = (dream: Dream, processedQuery: ReturnType<typeof processSearchQuery>): number => {
    let score = 0;
    const dreamText = `${dream.title} ${dream.content}`.toLowerCase();
    
    // Keyword matches (higher weight for title matches)
    processedQuery.keywords.forEach(keyword => {
      if (dream.title.toLowerCase().includes(keyword)) score += 3;
      if (dream.content.toLowerCase().includes(keyword)) score += 1;
    });
    
    // Emotional matches
    processedQuery.emotions.forEach(emotion => {
      if (dreamText.includes(emotion)) score += 2;
      if (dream.mood === emotion) score += 3;
    });
    
    // Conceptual matches
    processedQuery.concepts.forEach(concept => {
      if (dreamText.includes(concept)) score += 2;
    });
    
    // Tag matches
    const queryTags = processedQuery.keywords.filter(keyword =>
      dream.tags.some(tag => tag.toLowerCase().includes(keyword))
    );
    score += queryTags.length * 2;
    
    // Penalize negations
    processedQuery.negations.forEach(negation => {
      if (dreamText.includes(negation)) score -= 1;
    });
    
    return Math.max(0, score);
  };

  // Highlight matched terms in text
  const highlightMatches = (text: string, keywords: string[]): string => {
    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    return highlighted;
  };

  // Filter dreams based on criteria
  const filterDreams = (dreams: Dream[], filters: SearchFilters): Dream[] => {
    return dreams.filter(dream => {
      // Mood filter
      if (filters.mood !== 'all' && dream.mood !== filters.mood) return false;
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const dreamDate = new Date(dream.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'week': if (daysDiff > 7) return false; break;
          case 'month': if (daysDiff > 30) return false; break;
          case '3months': if (daysDiff > 90) return false; break;
          case 'year': if (daysDiff > 365) return false; break;
        }
      }
      
      // Content length filter
      if (dream.content.length < filters.minLength) return false;
      
      // Tag filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          dream.tags.some(dreamTag => dreamTag.toLowerCase().includes(filterTag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  };

  // Perform search
  const performSearch = useMemo(() => {
    if (!filters.query.trim()) {
      return filterDreams(dreams, filters)
        .map(dream => ({
          dream,
          relevanceScore: 1,
          matchedFields: [] as string[],
          highlights: {
            title: dream.title,
            content: dream.content.substring(0, 200) + '...'
          }
        }))
        .sort((a, b) => {
          if (filters.sortBy === 'date') {
            const dateA = new Date(a.dream.date).getTime();
            const dateB = new Date(b.dream.date).getTime();
            return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
          return 0;
        });
    }

    const processedQuery = processSearchQuery(filters.query);
    const filteredDreams = filterDreams(dreams, filters);
    
    const searchResults: SearchResult[] = filteredDreams
      .map(dream => {
        const relevanceScore = calculateRelevanceScore(dream, processedQuery);
        
        const matchedFields: string[] = [];
        if (processedQuery.keywords.some(kw => dream.title.toLowerCase().includes(kw))) {
          matchedFields.push('title');
        }
        if (processedQuery.keywords.some(kw => dream.content.toLowerCase().includes(kw))) {
          matchedFields.push('content');
        }
        
        const highlights = {
          title: matchedFields.includes('title') 
            ? highlightMatches(dream.title, processedQuery.keywords)
            : dream.title,
          content: matchedFields.includes('content')
            ? highlightMatches(dream.content.substring(0, 200) + '...', processedQuery.keywords)
            : dream.content.substring(0, 200) + '...'
        };
        
        return {
          dream,
          relevanceScore,
          matchedFields,
          highlights
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => {
        if (filters.sortBy === 'relevance') {
          return filters.sortOrder === 'asc' 
            ? a.relevanceScore - b.relevanceScore 
            : b.relevanceScore - a.relevanceScore;
        }
        if (filters.sortBy === 'date') {
          const dateA = new Date(a.dream.date).getTime();
          const dateB = new Date(b.dream.date).getTime();
          return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (filters.sortBy === 'length') {
          return filters.sortOrder === 'asc' 
            ? a.dream.content.length - b.dream.content.length
            : b.dream.content.length - a.dream.content.length;
        }
        return 0;
      });
    
    return searchResults;
  }, [dreams, filters]);

  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setResults(performSearch);
      setIsSearching(false);
    }, 300); // Debounce search

    return () => clearTimeout(timeout);
  }, [performSearch]);

  // Get all unique tags from dreams
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    dreams.forEach(dream => {
      dream.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [dreams]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <YStack space="$4" padding="$4">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <H3>🔍 Advanced Dream Search</H3>
        <Button
          size="$3"
          variant="outlined"
          onPress={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </XStack>

      {/* Search Input */}
      <YStack space="$3">
        <input
          type="text"
          placeholder="Search dreams with natural language... (e.g., 'flying dreams with happy emotions', 'nightmares about water')"
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          style={{
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            width: '100%',
          }}
        />
        
        {filters.query && (
          <Paragraph fontSize="$2" color="$gray10">
            Natural Language Processing: Understanding emotions, concepts, and context in your search
          </Paragraph>
        )}
      </YStack>

      {/* Advanced Filters */}
      {showFilters && (
        <YStack space="$4" padding="$4" backgroundColor="$gray1" borderRadius="$4">
          <H4>Search Filters</H4>
          
          {/* Mood Filter */}
          <YStack space="$2">
            <Paragraph fontWeight="600">Mood</Paragraph>
            <XStack space="$2" flexWrap="wrap">
              {(['all', 'positive', 'negative', 'neutral', 'mixed'] as const).map(mood => (
                <Button
                  key={mood}
                  size="$2"
                  variant={filters.mood === mood ? undefined : 'outlined'}
                  onPress={() => updateFilters({ mood })}
                >
                  {mood === 'all' ? 'All Moods' : mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Button>
              ))}
            </XStack>
          </YStack>

          <Separator />

          {/* Date Range Filter */}
          <YStack space="$2">
            <Paragraph fontWeight="600">Date Range</Paragraph>
            <XStack space="$2" flexWrap="wrap">
              {([
                { key: 'all', label: 'All Time' },
                { key: 'week', label: 'Past Week' },
                { key: 'month', label: 'Past Month' },
                { key: '3months', label: 'Past 3 Months' },
                { key: 'year', label: 'Past Year' }
              ] as const).map(({ key, label }) => (
                <Button
                  key={key}
                  size="$2"
                  variant={filters.dateRange === key ? undefined : 'outlined'}
                  onPress={() => updateFilters({ dateRange: key })}
                >
                  {label}
                </Button>
              ))}
            </XStack>
          </YStack>

          <Separator />

          {/* Sort Options */}
          <YStack space="$2">
            <Paragraph fontWeight="600">Sort By</Paragraph>
            <XStack space="$2">
              <XStack space="$1">
                {(['date', 'relevance', 'length'] as const).map(sortBy => (
                  <Button
                    key={sortBy}
                    size="$2"
                    variant={filters.sortBy === sortBy ? undefined : 'outlined'}
                    onPress={() => updateFilters({ sortBy })}
                  >
                    {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  </Button>
                ))}
              </XStack>
              <XStack space="$1">
                <Button
                  size="$2"
                  variant={filters.sortOrder === 'desc' ? undefined : 'outlined'}
                  onPress={() => updateFilters({ sortOrder: 'desc' })}
                >
                  ↓
                </Button>
                <Button
                  size="$2"
                  variant={filters.sortOrder === 'asc' ? undefined : 'outlined'}
                  onPress={() => updateFilters({ sortOrder: 'asc' })}
                >
                  ↑
                </Button>
              </XStack>
            </XStack>
          </YStack>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <>
              <Separator />
              <YStack space="$2">
                <Paragraph fontWeight="600">Tags</Paragraph>
                <XStack space="$2" flexWrap="wrap">
                  {allTags.slice(0, 10).map(tag => (
                    <Button
                      key={tag}
                      size="$1"
                      variant={filters.tags.includes(tag) ? undefined : 'outlined'}
                      onPress={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        updateFilters({ tags: newTags });
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </XStack>
              </YStack>
            </>
          )}
        </YStack>
      )}

      {/* Search Results */}
      <YStack space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <H4>
            {isSearching ? 'Searching...' : `${results.length} dream${results.length !== 1 ? 's' : ''} found`}
          </H4>
          {results.length > 0 && filters.query && (
            <Paragraph fontSize="$2" color="$gray10">
              Sorted by {filters.sortBy} ({filters.sortOrder === 'desc' ? 'newest' : 'oldest'} first)
            </Paragraph>
          )}
        </XStack>

        {/* Results List */}
        <YStack space="$3">
          {results.map((result) => (
            <YStack 
              key={result.dream.id} 
              padding="$4" 
              backgroundColor="$background" 
              borderRadius="$4"
              borderWidth={1}
              borderLeftWidth={4}
              borderLeftColor={result.relevanceScore > 5 ? '$green9' : result.relevanceScore > 3 ? '$blue9' : '$gray9'}
            >
              <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$2">
                <YStack flex={1}>
                  <H4 dangerouslySetInnerHTML={{ __html: result.highlights.title || result.dream.title }} />
                  <XStack space="$2" alignItems="center">
                    <Paragraph fontSize="$1" color="$gray8">
                      {new Date(result.dream.date).toLocaleDateString()}
                    </Paragraph>
                    <Paragraph fontSize="$1" color="$gray8" textTransform="capitalize">
                      {result.dream.mood}
                    </Paragraph>
                    {filters.query && (
                      <Paragraph fontSize="$1" color="$blue10" fontWeight="600">
                        Relevance: {result.relevanceScore}
                      </Paragraph>
                    )}
                  </XStack>
                </YStack>
              </XStack>

              <Paragraph 
                fontSize="$3" 
                color="$gray11" 
                marginBottom="$2"
                dangerouslySetInnerHTML={{ __html: result.highlights.content || result.dream.content.substring(0, 200) + '...' }}
              />

              {result.matchedFields.length > 0 && (
                <XStack space="$2" marginBottom="$2">
                  <Paragraph fontSize="$1" color="$gray8">Matches:</Paragraph>
                  {result.matchedFields.map(field => (
                    <YStack 
                      key={field}
                      padding="$1" 
                      paddingHorizontal="$2" 
                      backgroundColor="$blue2" 
                      borderRadius="$2"
                    >
                      <Paragraph fontSize="$1" color="$blue10">{field}</Paragraph>
                    </YStack>
                  ))}
                </XStack>
              )}

              {result.dream.tags.length > 0 && (
                <XStack space="$2" flexWrap="wrap">
                  {result.dream.tags.map(tag => (
                    <YStack 
                      key={tag}
                      padding="$1" 
                      paddingHorizontal="$2" 
                      backgroundColor="$gray2" 
                      borderRadius="$2"
                    >
                      <Paragraph fontSize="$1" color="$gray10">#{tag}</Paragraph>
                    </YStack>
                  ))}
                </XStack>
              )}
            </YStack>
          ))}
        </YStack>

        {/* No Results */}
        {!isSearching && results.length === 0 && filters.query && (
          <YStack padding="$4" backgroundColor="$gray1" borderRadius="$4" alignItems="center">
            <Paragraph fontSize="$4" marginBottom="$2">🔍</Paragraph>
            <H4>No dreams found</H4>
            <Paragraph textAlign="center" color="$gray10">
              Try adjusting your search terms or filters. Our NLP system understands natural language queries like:
            </Paragraph>
            <YStack space="$1" marginTop="$2">
              <Paragraph fontSize="$2" color="$blue10">• "happy flying dreams"</Paragraph>
              <Paragraph fontSize="$2" color="$blue10">• "nightmares about water"</Paragraph>
              <Paragraph fontSize="$2" color="$blue10">• "dreams with family last month"</Paragraph>
            </YStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};

export default AdvancedDreamSearch;