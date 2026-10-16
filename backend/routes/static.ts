import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import type { ServerResponse } from 'node:http';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
};

export async function serveStatic(url: string, response: ServerResponse, root = resolve('dist-simple')): Promise<void> {
  const resource = url.split('?')[0] === '/' ? '/index.html' : url.split('?')[0];
  let path: string;
  try {
    path = resolve(root, `.${decodeURIComponent(resource)}`);
  } catch {
    response.writeHead(400).end('Endereço inválido.');
    return;
  }
  if (!path.startsWith(root + sep)) {
    response.writeHead(404).end('Não encontrado.');
    return;
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Página indisponível. Execute npm run build.');
  }
}
