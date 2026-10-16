import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Repository } from '../types/Repository.ts';
import { getReport, addEntry } from '../services/report.ts';
import { readBody } from './body.ts';
import { logger } from '../adapters/logger.ts';

function json(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

export async function handleApi(request: IncomingMessage, response: ServerResponse, repository: Repository) {
  const url = new URL(request.url || '/', 'http://localhost');
  try {
    if (url.pathname === '/api/health') return json(response, 200, { app: 'moneta-simple' });
    if (url.pathname !== '/api/entries') return json(response, 404, { error: 'Rota não encontrada.' });
    if (request.method === 'GET') return json(response, 200, getReport(repository, url.searchParams.get('month') || ''));
    if (request.method !== 'POST') return json(response, 405, { error: 'Método não permitido.' });
    if (request.headers['x-moneta-request'] !== '1') return json(response, 403, { error: 'Origem da solicitação inválida.' });
    return json(response, 201, addEntry(repository, await readBody(request)));
  } catch (error) {
    if (error instanceof Error && !('code' in error)) return json(response, 400, { error: error.message });
    logger.error('Falha interna na operação financeira.');
    return json(response, 500, { error: 'Não foi possível salvar ou consultar. Tente novamente.' });
  }
}
