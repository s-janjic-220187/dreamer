/**
 * Utility functions for Dream Analyzer
 */

import type { DreamMood, DreamSymbol } from '../types';

// Date utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// String utilities
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Dream utilities
export const extractKeywords = (content: string): string[] => {
  // Simple keyword extraction - can be enhanced with NLP
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remove common words (basic stop words)
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 
    'did', 'man', 'new', 'now', 'old', 'see', 'way', 'who', 'oil', 'sit',
    'set', 'run', 'eat', 'far', 'sea', 'eye', 'let', 'own', 'say', 'she',
    'too', 'use', 'that', 'with', 'have', 'this', 'will', 'your', 'from',
    'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very',
    'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
    'such', 'take', 'than', 'them', 'well', 'were', 'what'
  ]);
  
  return Array.from(new Set(words.filter(word => !stopWords.has(word))));
};

export const generateDreamTitle = (content: string): string => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 'Untitled Dream';
  
  const firstSentence = sentences[0].trim();
  if (firstSentence.length <= 50) return firstSentence;
  
  return truncateText(firstSentence, 47);
};

export const getMoodColor = (mood: DreamMood): string => {
  const colors = {
    positive: '#22c55e', // green
    negative: '#ef4444', // red
    neutral: '#6b7280',  // gray
    mixed: '#f59e0b',    // amber
  };
  return colors[mood];
};

export const getMoodEmoji = (mood: DreamMood): string => {
  const emojis = {
    positive: '😊',
    negative: '😟',
    neutral: '😐',
    mixed: '🤔',
  };
  return emojis[mood];
};

// Symbol utilities
export const groupSymbolsByCategory = (symbols: DreamSymbol[]) => {
  return symbols.reduce((groups, symbol) => {
    const category = symbol.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(symbol);
    return groups;
  }, {} as Record<string, DreamSymbol[]>);
};

export const getTopSymbols = (symbols: DreamSymbol[], limit: number = 5): DreamSymbol[] => {
  return symbols
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
};

// Search utilities
export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array utilities
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Error utilities
export const createError = (code: string, message: string, details?: Record<string, unknown>) => {
  return {
    code,
    message,
    details,
  };
};

// Local storage utilities (for browser environments)
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};