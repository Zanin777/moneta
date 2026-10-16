import { expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createRepository } from '../data/entries.ts';
import { makeServer } from '../server.ts';

async function open(filename: string) {
  const repository = createRepository(filename);
  const server = makeServer(repository);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    base,
    async close(): Promise<void> {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repository.close();
    },
  };
}

it('TI-02 mantém lançamento após reiniciar API e conexão SQLite', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'moneta-restart-'));
  const filename = join(directory, 'test.sqlite');
  let api = await open(filename);
  try {
    const response = await fetch(`${api.base}/api/entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Moneta-Request': '1' },
      body: JSON.stringify({ kind: 'income', description: 'Persistente', category: 'Outros', amount: 30, date: '2026-12-31' }),
    });
    expect(response.status).toBe(201);
    await api.close();
    api = await open(filename);
    const report = await fetch(`${api.base}/api/entries?month=2026-12`).then((result) => result.json());
    expect(report.balance).toBe(30);
    expect(report.entries[0].description).toBe('Persistente');
    const empty = await fetch(`${api.base}/api/entries?month=2027-01`).then((result) => result.json());
    expect(empty).toMatchObject({ entries: [], balance: 0 });
  } finally {
    await api.close();
    rmSync(directory, { recursive: true });
  }
});
