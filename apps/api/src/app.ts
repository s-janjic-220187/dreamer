import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { dreamRoutes } from './routes/dreams';

export function build(opts: { logger?: boolean | object } = {}): FastifyInstance {
  const app = fastify({ 
    logger: opts.logger ?? false,
  });

  // Register plugins
  app.register(cors, {
    origin: true,
  });

  app.register(swagger, {
    swagger: {
      info: {
        title: 'Dream Analyzer API',
        description: 'API for managing dreams and AI analysis',
        version: '0.1.0',
      },
      host: 'localhost:3001',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  });

  // Register routes
  app.register(dreamRoutes, { prefix: '/api/v1' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    const { validation, validationContext } = error as any;
    
    if (validation) {
      reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            validation,
            validationContext,
          },
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}