import type { MonthReport } from '../../shared/types/MonthReport.ts';
import type { Entry } from '../../shared/types/Entry';
import type { Repository } from '../types/Repository.ts';
import { validateEntry, validateMonth } from '../../shared/validation.ts';

export function getReport(repository: Repository, month: string): MonthReport {
  const entries = repository.list(validateMonth(month));
  const income = entries.filter((entry) => entry.kind === 'income')
    .reduce((total, entry) => total + BigInt(entry.amount), 0n);
  const expense = entries.filter((entry) => entry.kind === 'expense')
    .reduce((total, entry) => total + BigInt(entry.amount), 0n);
  if (income > BigInt(Number.MAX_SAFE_INTEGER) || expense > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('O total do mês excede o limite seguro.');
  }
  return { entries, income: Number(income), expense: Number(expense), balance: Number(income - expense) };
}

export function addEntry(repository: Repository, input: unknown): Entry {
  return repository.add(validateEntry(input));
}
