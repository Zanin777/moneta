import type { EntryInput } from './types/EntryInput';

const MAX_CENTS = 1_000_000_000;
const MAX_TEXT_LENGTH = 120;

export function validateMonth(value: string): string {
  if (!/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new Error('Selecione um mês válido.');
  }
  return value;
}

export function validateDate(value: unknown): string {
  if (typeof value !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Informe uma data válida.');
  }
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Informe uma data válida.');
  }
  return value;
}

function requiredText(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > MAX_TEXT_LENGTH) {
    throw new Error(`${label}: informe de 1 a ${MAX_TEXT_LENGTH} caracteres.`);
  }
  return value.trim();
}

export function validateEntry(value: unknown): EntryInput {
  if (!value || typeof value !== 'object') throw new Error('Lançamento inválido.');
  const input = value as Record<string, unknown>;
  if (input.kind !== 'income' && input.kind !== 'expense') {
    throw new Error('Selecione receita ou despesa.');
  }
  if (typeof input.amount !== 'number' || !Number.isSafeInteger(input.amount)
    || input.amount <= 0 || input.amount > MAX_CENTS) {
    throw new Error('Informe um valor positivo em centavos, até R$ 10.000.000,00.');
  }
  return {
    kind: input.kind,
    description: requiredText(input.description, 'Descrição'),
    category: requiredText(input.category, 'Categoria'),
    amount: input.amount,
    date: validateDate(input.date),
  };
}
