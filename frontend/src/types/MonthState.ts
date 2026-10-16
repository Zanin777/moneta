import type { MonthReport } from '../../../shared/types/MonthReport';

export interface MonthState {
  report: MonthReport | null;
  error: string;
}
