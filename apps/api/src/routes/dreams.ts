import { FastifyInstance } from 'fastify';
import { dreamService } from '../services/dream.service';

export async function dreamRoutes(fastify: FastifyInstance) {
  // Create a new dream
  fastify.post('/dreams', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 10, maxLength: 5000 },
          date: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' }, default: [] },
          mood: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'], default: 'neutral' },
          audioPath: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const dream = await dreamService.createDream(request.body);
        return reply.code(201).send({
          success: true,
          data: dream,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'CREATION_FAILED',
            message: 'Failed to create dream',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });

  // Get all dreams with optional search/filtering
  fastify.get('/dreams', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          mood: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['date', 'title', 'mood'], default: 'date' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                dreams: { type: 'array' },
                total: { type: 'number' },
                hasMore: { type: 'boolean' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await dreamService.searchDreams(request.query);
        return reply.send({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'SEARCH_FAILED',
            message: 'Failed to search dreams',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });

  // Get a specific dream by ID
  fastify.get('/dreams/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const dream = await dreamService.getDreamById(id);
        
        if (!dream) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'DREAM_NOT_FOUND',
              message: 'Dream not found',
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: dream,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch dream',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });

  // Update a dream
  fastify.put('/dreams/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 10, maxLength: 5000 },
          date: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' } },
          mood: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
          audioPath: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const dream = await dreamService.updateDream(id, request.body);
        
        if (!dream) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'DREAM_NOT_FOUND',
              message: 'Dream not found',
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: dream,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update dream',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });

  // Delete a dream
  fastify.delete('/dreams/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const success = await dreamService.deleteDream(id);
        
        if (!success) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'DREAM_NOT_FOUND',
              message: 'Dream not found',
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.code(204).send();
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete dream',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });

  // Analyze a dream (trigger AI analysis)
  fastify.post('/dreams/:id/analyze', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const analysis = await dreamService.analyzeDream(id);
        
        if (!analysis) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'DREAM_NOT_FOUND',
              message: 'Dream not found',
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: {
            code: 'ANALYSIS_FAILED',
            message: 'Failed to analyze dream',
            details: error,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  });
}