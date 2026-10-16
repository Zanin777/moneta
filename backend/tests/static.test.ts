import { expect, it } from 'vitest';
import { createRepository } from '../data/entries.ts';
import { makeServer } from '../server.ts';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

it('TI-03 serve build e informa arquivo ausente', async () => {
  const repository = createRepository(':memory:');
  const directory = mkdtempSync(join(tmpdir(), 'moneta-static-'));
  writeFileSync(join(directory, 'index.html'), '<title>MONETA</title>');
  const server = makeServer(repository, directory);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const response = await fetch(`${base}/`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(await response.text()).toContain('MONETA');
    expect((await fetch(`${base}/missing`)).status).toBe(404);
    expect((await fetch(`${base}/..%2fpackage.json`)).status).toBe(404);
    expect((await fetch(`${base}/%ZZ`)).status).toBe(400);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    repository.close();
    rmSync(directory, { recursive: true });
  }
});
