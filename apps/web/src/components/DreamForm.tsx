import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack } from '@tamagui/stacks';
import { H2, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { Separator } from '@tamagui/separator';
import { useDreamStore } from '../stores/dreamStore';

interface DreamFormProps {
  dreamId?: string; // If provided, we're editing an existing dream
}

export function DreamForm({ dreamId }: DreamFormProps) {
  const navigate = useNavigate();
  const { createDream, updateDream, fetchDreamById, currentDream, isLoading } = useDreamStore();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as 'positive' | 'negative' | 'neutral' | 'mixed',
    tags: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load dream data if editing
  useEffect(() => {
    if (dreamId) {
      fetchDreamById(dreamId);
    }
  }, [dreamId, fetchDreamById]);

  // Update form data when current dream changes
  useEffect(() => {
    if (currentDream && dreamId) {
      setFormData({
        title: currentDream.title || '',
        content: currentDream.content || '',
        mood: currentDream.mood || 'neutral',
        tags: currentDream.tags?.join(', ') || '',
        date: currentDream.date ? new Date(currentDream.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [currentDream, dreamId]);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Dream content is required';
    }
    
    if (formData.content.trim().length < 10) {
      errors.content = 'Dream content should be at least 10 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dreamData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      mood: formData.mood,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
    };

    try {
      let result;
      if (dreamId) {
        // Editing existing dream
        result = await updateDream(dreamId, dreamData);
      } else {
        // Creating new dream
        result = await createDream(dreamData);
      }
      
      if (result) {
        navigate(`/dreams/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to save dream:', error);
    }
  };

  const handleCancel = () => {
    if (dreamId) {
      navigate(`/dreams/${dreamId}`);
    } else {
      navigate('/dreams');
    }
  };

  return (
    <YStack space="$4" padding="$4">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <H2>{dreamId ? 'Edit Dream' : 'Record New Dream'}</H2>
        <Button variant="outlined" onPress={handleCancel}>
          Cancel
        </Button>
      </XStack>

      <Separator />

      {/* Form */}
      <YStack space="$4" maxWidth={600}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Title */}
          <YStack space="$2" marginBottom="$4">
            <label htmlFor="title" style={{ fontSize: '16px', fontWeight: '600' }}>
              Dream Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your dream a memorable title..."
              style={{
                padding: '12px',
                fontSize: '16px',
                border: validationErrors.title ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                width: '100%',
              }}
            />
            {validationErrors.title && (
              <Paragraph color="$red10" fontSize="$3">
                {validationErrors.title}
              </Paragraph>
            )}
          </YStack>

          {/* Date */}
          <YStack space="$2" marginBottom="$4">
            <label htmlFor="date" style={{ fontSize: '16px', fontWeight: '600' }}>
              Dream Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              style={{
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                width: '100%',
              }}
            />
          </YStack>

          {/* Mood */}
          <YStack space="$2" marginBottom="$4">
            <label htmlFor="mood" style={{ fontSize: '16px', fontWeight: '600' }}>
              Overall Mood
            </label>
            <select
              id="mood"
              value={formData.mood}
              onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value as any }))}
              style={{
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                width: '100%',
                backgroundColor: 'white',
              }}
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="mixed">Mixed</option>
              <option value="negative">Negative</option>
            </select>
          </YStack>

          {/* Content */}
          <YStack space="$2" marginBottom="$4">
            <label htmlFor="content" style={{ fontSize: '16px', fontWeight: '600' }}>
              Dream Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Describe your dream in detail. What did you see, feel, or experience?"
              rows={8}
              style={{
                padding: '12px',
                fontSize: '16px',
                border: validationErrors.content ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                width: '100%',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            {validationErrors.content && (
              <Paragraph color="$red10" fontSize="$3">
                {validationErrors.content}
              </Paragraph>
            )}
            <Paragraph color="$gray10" fontSize="$3">
              Try to include as many details as you can remember - people, places, emotions, colors, sounds, etc.
            </Paragraph>
          </YStack>

          {/* Tags */}
          <YStack space="$2" marginBottom="$4">
            <label htmlFor="tags" style={{ fontSize: '16px', fontWeight: '600' }}>
              Tags (optional)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="flying, water, family, work, animals (separate with commas)"
              style={{
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                width: '100%',
              }}
            />
            <Paragraph color="$gray10" fontSize="$3">
              Add tags to help categorize and find your dreams later.
            </Paragraph>
          </YStack>

          {/* Actions */}
          <XStack space="$3" marginTop="$6">
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: isLoading ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
              }}
            >
              {isLoading ? 'Saving...' : (dreamId ? 'Update Dream' : 'Save Dream')}
            </button>
          </XStack>
        </form>
      </YStack>
    </YStack>
  );
}