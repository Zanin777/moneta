import { afterEach, beforeEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRepository } from '../data/entries.ts';
import { addEntry, getReport } from '../services/report.ts';

let directory: string;
let repository: ReturnType<typeof createRepository>;
const input = { kind: 'income', description: 'Teste', category: 'Outros', amount: 10, date: '2026-10-01' };

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'moneta-test-'));
  repository = createRepository(join(directory, 'test.sqlite'));
});

afterEach(() => {
  repository.close();
  rmSync(directory, { recursive: true });
});

it('TI-01 calcula centavos, separa meses e produz saldo negativo', () => {
  addEntry(repository, input);
  addEntry(repository, { ...input, amount: 20 });
  addEntry(repository, { ...input, kind: 'expense', amount: 50, date: '2026-10-31' });
  addEntry(repository, { ...input, amount: 100, date: '2026-11-01' });
  expect(getReport(repository, '2026-10')).toMatchObject({ income: 30, expense: 50, balance: -20 });
  expect(getReport(repository, '2026-09')).toEqual({ entries: [], income: 0, expense: 0, balance: 0 });
  expect(getReport(repository, '2026-11').entries).toHaveLength(1);
});

it('TI-02 preserva dados após fechar e reabrir o banco', () => {
  const entry = addEntry(repository, input);
  repository.close();
  repository = createRepository(join(directory, 'test.sqlite'));
  expect(getReport(repository, '2026-10').entries).toEqual([entry]);
});

it('TI-03 trata SQL malicioso como texto literal', () => {
  const description = "'); DROP TABLE simple_entries; --";
  addEntry(repository, { ...input, description });
  expect(getReport(repository, '2026-10').entries[0].description).toBe(description);
  expect(() => getReport(repository, "2026-10' OR 1=1")).toThrow();
});

it('TI-01 bloqueia total fora do intervalo seguro', () => {
  const huge = { ...input, id: '1', kind: 'income' as const, amount: Number.MAX_SAFE_INTEGER };
  const fake = { add: repository.add, close: repository.close, list: () => [huge, huge] };
  expect(() => getReport(fake, '2026-10')).toThrow('limite seguro');
});
