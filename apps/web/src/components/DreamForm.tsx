import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { Separator } from '@tamagui/separator';
import { XStack, YStack } from '@tamagui/stacks';
import { H2, Paragraph } from '@tamagui/text';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const saveDream = async () => {
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
        {/* Title */}
        <YStack space="$2" marginBottom="$4">
          <Label htmlFor="title" fontSize="$4" fontWeight="600">
            Dream Title
          </Label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Give your dream a memorable title..."
            style={{
              padding: '12px',
              borderRadius: '8px',
              borderWidth: validationErrors.title ? '2px' : '1px',
              borderStyle: 'solid',
              borderColor: validationErrors.title ? '#ef4444' : 'hsl(var(--border-color))',
              fontSize: '16px',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--color))',
              width: '100%',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = validationErrors.title ? '#ef4444' : 'hsl(var(--blue8))';
              e.target.style.boxShadow = validationErrors.title ? '0 0 0 1px #ef4444' : '0 0 0 1px hsl(var(--blue8))';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = validationErrors.title ? '#ef4444' : 'hsl(var(--border-color))';
              e.target.style.boxShadow = 'none';
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
          <Label htmlFor="date" fontSize="$4" fontWeight="600">
            Dream Date
          </Label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'hsl(var(--border-color))',
              fontSize: '16px',
              width: '100%',
              outline: 'none',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--color))',
              colorScheme: 'dark light',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 1px #3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </YStack>

        {/* Mood */}
        <YStack space="$2" marginBottom="$4">
          <Label htmlFor="mood" fontSize="$4" fontWeight="600">
            Overall Mood
          </Label>
          <select
            id="mood"
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value as any }))}
            style={{
              padding: '12px',
              borderRadius: '8px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'hsl(var(--border-color))',
              fontSize: '16px',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--color))',
              width: '100%',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'hsl(var(--blue8))';
              e.target.style.boxShadow = '0 0 0 1px hsl(var(--blue8))';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'hsl(var(--border-color))';
              e.target.style.boxShadow = 'none';
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
          <Label htmlFor="content" fontSize="$4" fontWeight="600">
            Dream Content
          </Label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Describe your dream in detail. What did you see, feel, or experience?"
            rows={8}
            style={{
              padding: '12px',
              borderRadius: '8px',
              borderWidth: validationErrors.content ? '2px' : '1px',
              borderStyle: 'solid',
              borderColor: validationErrors.content ? '#ef4444' : 'hsl(var(--border-color))',
              fontSize: '16px',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--color))',
              width: '100%',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = validationErrors.content ? '#ef4444' : 'hsl(var(--blue8))';
              e.target.style.boxShadow = validationErrors.content ? '0 0 0 1px #ef4444' : '0 0 0 1px hsl(var(--blue8))';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = validationErrors.content ? '#ef4444' : 'hsl(var(--border-color))';
              e.target.style.boxShadow = 'none';
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
          <Label htmlFor="tags" fontSize="$4" fontWeight="600">
            Tags (optional)
          </Label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="flying, water, family, work, animals (separate with commas)"
            style={{
              padding: '12px',
              borderRadius: '8px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'hsl(var(--border-color))',
              fontSize: '16px',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--color))',
              width: '100%',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'hsl(var(--blue8))';
              e.target.style.boxShadow = '0 0 0 1px hsl(var(--blue8))';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'hsl(var(--border-color))';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Paragraph color="$gray10" fontSize="$3">
            Add tags to help categorize and find your dreams later.
          </Paragraph>
        </YStack>

        {/* Actions */}
        <XStack space="$3" marginTop="$6">
          <Button
            onPress={saveDream}
            disabled={isLoading}
            theme="blue"
            size="$4"
            flex={1}
            backgroundColor={isLoading ? '$gray8' : '$blue9'}
            color="white"
            fontWeight="600"
          >
            {isLoading ? 'Saving...' : (dreamId ? 'Update Dream' : 'Save Dream')}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}