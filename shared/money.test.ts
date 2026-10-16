import { expect, it } from 'vitest';
import { parseMoney, formatMoney } from './money';
import { validateEntry, validateMonth, validateDate } from './validation';

const valid = { kind: 'income', description: 'Salário', category: 'Trabalho', amount: 10, date: '2026-10-15' };

it('TU-01 converte decimais exatamente e formata reais', () => {
  expect(parseMoney('0,10') + parseMoney('0.20')).toBe(30);
  expect(parseMoney(' 1250,5 ')).toBe(125050);
  expect(formatMoney(-30).replaceAll('\u00a0', ' ')).toBe('-R$ 0,30');
});

it.each(['', '0', '-1', '1,001', '1.000,00', '1e2', 'Infinity', '10000001'])('TU-01 rejeita valor %s', (value) => {
  expect(() => parseMoney(value)).toThrow();
});

it('TU-01 valida e normaliza textos', () => {
  expect(validateEntry({ ...valid, description: ' Salário ' })).toEqual(valid);
  expect(validateMonth('9999-12')).toBe('9999-12');
  expect(validateDate('2024-02-29')).toBe('2024-02-29');
});

it.each([null, {}, { ...valid, kind: 'transfer' }, { ...valid, amount: 0 },
  { ...valid, amount: -1 }, { ...valid, amount: 1.1 }, { ...valid, amount: '10' },
  { ...valid, amount: 1_000_000_001 }, { ...valid, description: ' ' },
  { ...valid, category: 'x'.repeat(121) }, { ...valid, date: '2026-02-30' },
  { ...valid, date: '2026-13-01' }, { ...valid, date: 10 },
])('TU-01 rejeita lançamento inválido %#', (value) => {
  expect(() => validateEntry(value)).toThrow();
});

it.each(['2026-00', '2026-13', '', '0000-01', '2026-1'])('TU-01 rejeita mês %s', (month) => {
  expect(() => validateMonth(month)).toThrow();
});
