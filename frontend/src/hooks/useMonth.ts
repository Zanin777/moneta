import { useEffect, useState } from 'react';
import { loadMonth } from '../services/entries';
import type { MonthReport } from '../../../shared/types/MonthReport';
import type { MonthState } from '../types/MonthState';

export function useMonth(month: string, revision: number): MonthState {
  const [report, setReport] = useState<MonthReport | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setReport(null);
    setError('');
    loadMonth(month, controller.signal).then((result) => {
      if (!controller.signal.aborted) setReport(result);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Erro ao consultar mês.');
    });
    return () => controller.abort();
  }, [month, revision]);
  return { report, error };
}
