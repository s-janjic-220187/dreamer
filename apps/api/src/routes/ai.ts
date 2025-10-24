import type { AIAnalysisRequest } from '@dreamer/shared';
import { FastifyInstance } from 'fastify';
import { aiService } from '../services/ai.service';
import { dreamService } from '../services/dream.service';

export async function aiRoutes(fastify: FastifyInstance) {
    // Analyze a dream
    fastify.post('/ai/analyze', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    dreamContent: { type: 'string', minLength: 1 },
                    dreamTitle: { type: 'string' },
                    dreamId: { type: 'string' },
                    mood: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
                    tags: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                },
                required: ['dreamContent'],
                additionalProperties: false,
            },
        },
        handler: async (request, reply) => {
            try {
                const analysisRequest = request.body as AIAnalysisRequest;

                // Get previous analyses if dreamId is provided
                if (analysisRequest.dreamId) {
                    const dream = await dreamService.getDreamById(analysisRequest.dreamId);
                    if (dream?.analysis) {
                        analysisRequest.previousAnalyses = [dream.analysis];
                    }
                }

                const analysis = await aiService.analyzeDream(analysisRequest);

                return reply.send({
                    success: true,
                    data: analysis,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error('AI analysis failed:', error);
                return reply.code(500).send({
                    success: false,
                    error: {
                        code: 'AI_ANALYSIS_FAILED',
                        message: 'Failed to analyze dream',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        },
    });

    // Get pattern insights across multiple dreams
    fastify.post('/ai/patterns', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    dreamIds: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 1,
                    },
                },
                required: ['dreamIds'],
                additionalProperties: false,
            },
        },
        handler: async (request, reply) => {
            try {
                const { dreamIds } = request.body as { dreamIds: string[] };

                // Fetch dreams from database
                const dreams = [];
                for (const dreamId of dreamIds) {
                    const dream = await dreamService.getDreamById(dreamId);
                    if (dream) {
                        dreams.push(dream);
                    }
                }

                if (dreams.length === 0) {
                    return reply.code(404).send({
                        success: false,
                        error: {
                            code: 'NO_DREAMS_FOUND',
                            message: 'No dreams found for the provided IDs',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }

                const insights = await aiService.getPatternInsights(dreams);

                return reply.send({
                    success: true,
                    data: insights,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Pattern analysis failed:', error);
                return reply.code(500).send({
                    success: false,
                    error: {
                        code: 'PATTERN_ANALYSIS_FAILED',
                        message: 'Failed to analyze patterns',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        },
    });

    // Get personalized insights
    fastify.get('/ai/insights', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
                },
                additionalProperties: false,
            },
        },
        handler: async (request, reply) => {
            try {
                const { limit } = request.query as { limit?: number };

                // Get recent dreams for the user (for now, get all dreams)
                // In a real app, you'd filter by user ID
                const dreamSearchResult = await dreamService.searchDreams({
                    limit: limit || 10,
                    sortBy: 'date',
                    sortOrder: 'desc',
                });

                const insights = await aiService.getPersonalizedInsights(dreamSearchResult.dreams);

                return reply.send({
                    success: true,
                    data: insights,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Insights generation failed:', error);
                return reply.code(500).send({
                    success: false,
                    error: {
                        code: 'INSIGHTS_FAILED',
                        message: 'Failed to generate insights',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        },
    });

    // Generate journal prompts
    fastify.get('/ai/prompts', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    count: { type: 'number', minimum: 1, maximum: 10, default: 3 },
                },
                additionalProperties: false,
            },
        },
        handler: async (request, reply) => {
            try {
                const { count } = request.query as { count?: number };

                const prompts = [
                    "What emotions did you experience most vividly in today's dreams?",
                    "Were there any recurring symbols or themes in your recent dreams?",
                    "How do your dreams reflect your current life situation?",
                    "What aspects of your dreams felt most significant or meaningful?",
                    "Did any dream characters represent people or aspects of yourself?",
                    "What colors, sounds, or sensations stood out in your dreams?",
                    "How did the dream environment or setting affect your experience?",
                    "What message might your subconscious be trying to convey?"
                ];

                // Randomly select prompts
                const selectedPrompts = prompts
                    .sort(() => 0.5 - Math.random())
                    .slice(0, count || 3);

                return reply.send({
                    success: true,
                    data: selectedPrompts,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Prompt generation failed:', error);
                return reply.code(500).send({
                    success: false,
                    error: {
                        code: 'PROMPT_GENERATION_FAILED',
                        message: 'Failed to generate prompts',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        },
    });
}