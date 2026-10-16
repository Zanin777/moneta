import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { Repository } from './types/Repository.ts';
import { handleApi } from './routes/api.ts';
import { serveStatic } from './routes/static.ts';

export function makeServer(repository: Repository, staticRoot?: string): Server {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.url?.startsWith('/api/')) {
      await handleApi(request, response, repository);
      return;
    }
    await serveStatic(request.url || '/', response, staticRoot);
  });
}
