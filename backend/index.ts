import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRepository } from './data/entries.ts';
import { makeServer } from './server.ts';
import { registerShutdown } from './config/shutdown.ts';
import { logger } from './adapters/logger.ts';

const directory = resolve(process.env.MONETA_SIMPLE_DATA_DIR || '.local-simple');
mkdirSync(directory, { recursive: true });
const repository = createRepository(resolve(directory, 'simple.sqlite'));
const server = makeServer(repository);
const port = Number(process.env.SIMPLE_PORT || 3002);
server.listen(port, '127.0.0.1', () => logger.info(`MONETA simples: http://127.0.0.1:${port}`));
server.on('error', () => {
  logger.error('Não foi possível iniciar. Verifique a porta da API.');
  repository.close();
  process.exitCode = 1;
});
registerShutdown(server, repository);
