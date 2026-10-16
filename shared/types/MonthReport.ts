import type { Entry } from './Entry';

export interface MonthReport {
  entries: Entry[];
  income: number;
  expense: number;
  balance: number;
}
