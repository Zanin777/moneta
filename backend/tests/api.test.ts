import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createRepository } from '../data/entries.ts';
import { makeServer } from '../server.ts';

let repository: ReturnType<typeof createRepository>;
let server: ReturnType<typeof makeServer>;
let base: string;
const input = { kind: 'expense', description: 'Café', category: 'Alimentação', amount: 350, date: '2026-10-15' };
const headers = { 'Content-Type': 'application/json', 'X-Moneta-Request': '1' };

beforeEach(async () => {
  repository = createRepository(':memory:');
  server = makeServer(repository);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  repository.close();
  vi.restoreAllMocks();
});

it('TI-01 salva pela API sem login e consulta saldo', async () => {
  const response = await fetch(`${base}/api/entries`, { method: 'POST', headers, body: JSON.stringify(input) });
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject(input);
  const report = await fetch(`${base}/api/entries?month=2026-10`).then((result) => result.json());
  expect(report).toMatchObject({ income: 0, expense: 350, balance: -350 });
});

it.each([{ ...input, amount: -1 }, { ...input, date: '2026-02-30' }, { ...input, category: '' }])('TI-01 valida a API %#', async (value) => {
  const response = await fetch(`${base}/api/entries`, { method: 'POST', headers, body: JSON.stringify(value) });
  expect(response.status).toBe(400);
  expect((await response.json()).error).toBeTruthy();
});

it('TI-03 rejeita JSON, content type e corpo excessivo', async () => {
  for (const body of ['{', 'x'.repeat(17000)]) {
    const response = await fetch(`${base}/api/entries`, { method: 'POST', headers, body });
    expect(response.status).toBe(400);
  }
  const response = await fetch(`${base}/api/entries`, { method: 'POST', headers: { 'X-Moneta-Request': '1' }, body: '{}' });
  expect(response.status).toBe(400);
});

it('TI-03 valida protocolo, mês e rotas', async () => {
  expect((await fetch(`${base}/api/health`)).status).toBe(200);
  expect((await fetch(`${base}/api/unknown`)).status).toBe(404);
  expect((await fetch(`${base}/api/entries`)).status).toBe(400);
  expect((await fetch(`${base}/api/entries`, { method: 'DELETE' })).status).toBe(405);
  expect((await fetch(`${base}/api/entries`, { method: 'POST' })).status).toBe(403);
});

it('TI-03 sanitiza falhas do banco', async () => {
  vi.spyOn(repository, 'list').mockImplementation(() => { throw Object.assign(new Error('SQL secreto'), { code: 'SQLITE_ERROR' }); });
  const response = await fetch(`${base}/api/entries?month=2026-10`);
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain('SQL secreto');
});
