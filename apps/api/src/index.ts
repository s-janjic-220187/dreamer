import { build } from './app';

const server = build({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

async function startServer() {
  try {
    // Start server
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    const host = process.env.HOST || '127.0.0.1';

    await server.listen({ port, host });
    console.log(`🚀 Dream Analyzer API server ready at http://${host}:${port}`);
    console.log(`📚 API Documentation available at http://${host}:${port}/docs`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.close();
      console.log('Server closed');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
});

if (require.main === module) {
  startServer();
}

export { server, build };