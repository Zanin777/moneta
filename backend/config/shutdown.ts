import type { Server } from 'node:http';
import type { Repository } from '../types/Repository.ts';
import { logger } from '../adapters/logger.ts';

const TIMEOUT_MS = 10_000;

export function registerShutdown(server: Server, repository: Repository): void {
  let stopping = false;
  function stop(): void {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), TIMEOUT_MS);
    server.close(() => {
      repository.close();
      clearTimeout(timeout);
      logger.info('MONETA encerrado.');
    });
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
