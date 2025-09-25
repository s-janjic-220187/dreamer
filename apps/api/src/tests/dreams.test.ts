import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { build } from '../app';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

describe('Dreams API Endpoints', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = build({ logger: false });
    prisma = new PrismaClient();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.dreamAnalysis.deleteMany();
    await prisma.dream.deleteMany();
  });

  describe('POST /api/v1/dreams', () => {
    it('should create a new dream successfully', async () => {
      const dreamData = {
        title: 'Flying over mountains',
        content: 'I dreamed I was flying over beautiful snow-capped mountains. The sky was crystal clear and I felt incredibly free.',
        mood: 'positive',
        tags: ['flying', 'mountains', 'freedom']
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/dreams',
        payload: dreamData,
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.title).toBe(dreamData.title);
      expect(body.data.content).toBe(dreamData.content);
      expect(body.data.mood).toBe(dreamData.mood);
      expect(body.data.tags).toEqual(dreamData.tags);
      expect(body.data.id).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should return validation error for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/dreams',
        payload: {
          title: 'Only title'
          // Missing content
        },
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should use default values for optional fields', async () => {
      const dreamData = {
        title: 'Simple dream',
        content: 'Just a simple dream with minimal data.',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/dreams',
        payload: dreamData,
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.data.mood).toBe('neutral');
      expect(body.data.tags).toEqual([]);
    });
  });

  describe('GET /api/v1/dreams', () => {
    beforeEach(async () => {
      // Create some test dreams
      const testDreams = [
        {
          title: 'Flying Dream',
          content: 'I was flying through clouds',
          mood: 'positive',
          tags: JSON.stringify(['flying', 'sky']),
          date: new Date('2024-01-15'),
        },
        {
          title: 'Ocean Dream',
          content: 'Swimming in deep blue ocean',
          mood: 'neutral',
          tags: JSON.stringify(['water', 'ocean']),
          date: new Date('2024-01-16'),
        },
        {
          title: 'Nightmare',
          content: 'Being chased by unknown figures',
          mood: 'negative',
          tags: JSON.stringify(['scary', 'chase']),
          date: new Date('2024-01-17'),
        },
      ];

      for (const dream of testDreams) {
        await prisma.dream.create({ data: dream });
      }
    });

    it('should return all dreams', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dreams',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.dreams).toBeDefined();
      expect(body.data.dreams).toHaveLength(3);
      expect(body.data.total).toBe(3);
      expect(body.data.hasMore).toBe(false);
    });

    it('should filter dreams by mood', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dreams?mood=positive',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.dreams).toHaveLength(1);
      expect(body.data.dreams[0].mood).toBe('positive');
    });

    it('should search dreams by query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dreams?query=flying',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.dreams.length).toBeGreaterThan(0);
      expect(
        body.data.dreams.some((dream: any) => 
          dream.title.toLowerCase().includes('flying') || 
          dream.content.toLowerCase().includes('flying')
        )
      ).toBe(true);
    });

    it('should respect pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dreams?limit=2&offset=0',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.dreams).toHaveLength(2);
      expect(body.data.total).toBe(3);
      expect(body.data.hasMore).toBe(true);
    });
  });

  describe('GET /api/v1/dreams/:id', () => {
    let testDreamId: string;

    beforeEach(async () => {
      const dream = await prisma.dream.create({
        data: {
          title: 'Test Dream',
          content: 'This is a test dream for fetching by ID',
          mood: 'neutral',
          tags: JSON.stringify(['test']),
          date: new Date(),
        },
      });
      testDreamId = dream.id;
    });

    it('should return a specific dream by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/dreams/${testDreamId}`,
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testDreamId);
      expect(body.data.title).toBe('Test Dream');
    });

    it('should return 404 for non-existent dream', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/dreams/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('DREAM_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/dreams/:id', () => {
    let testDreamId: string;

    beforeEach(async () => {
      const dream = await prisma.dream.create({
        data: {
          title: 'Original Title',
          content: 'Original content',
          mood: 'neutral',
          tags: JSON.stringify(['original']),
          date: new Date(),
        },
      });
      testDreamId = dream.id;
    });

    it('should update a dream successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        mood: 'positive',
        tags: ['updated', 'modified']
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/dreams/${testDreamId}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe(updateData.title);
      expect(body.data.mood).toBe(updateData.mood);
      expect(body.data.tags).toEqual(updateData.tags);
      // Content should remain unchanged
      expect(body.data.content).toBe('Original content');
    });

    it('should return 404 for non-existent dream', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/dreams/${fakeId}`,
        payload: { title: 'Updated' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/dreams/:id', () => {
    let testDreamId: string;

    beforeEach(async () => {
      const dream = await prisma.dream.create({
        data: {
          title: 'Dream to Delete',
          content: 'This dream will be deleted',
          mood: 'neutral',
          tags: JSON.stringify([]),
          date: new Date(),
        },
      });
      testDreamId = dream.id;
    });

    it('should delete a dream successfully', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/dreams/${testDreamId}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify dream is deleted
      const checkResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/dreams/${testDreamId}`,
      });
      expect(checkResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent dream', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/dreams/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/dreams/:id/analyze', () => {
    let testDreamId: string;

    beforeEach(async () => {
      const dream = await prisma.dream.create({
        data: {
          title: 'Dream to Analyze',
          content: 'I dreamed of flying through a magical forest filled with talking animals',
          mood: 'positive',
          tags: JSON.stringify(['flying', 'animals', 'magic']),
          date: new Date(),
        },
      });
      testDreamId = dream.id;
    });

    it('should analyze a dream and return analysis', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/dreams/${testDreamId}/analyze`,
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.interpretation).toBeDefined();
      expect(body.data.symbols).toBeDefined();
      expect(body.data.themes).toBeDefined();
      expect(body.data.confidence).toBeDefined();
      expect(body.data.modelUsed).toBeDefined();
    });

    it('should return 404 for non-existent dream', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/dreams/${fakeId}/analyze`,
      });

      expect(response.statusCode).toBe(404);
    });
  });
});