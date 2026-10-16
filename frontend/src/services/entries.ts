import type { EntryInput } from '../../../shared/types/EntryInput';
import type { Entry } from '../../../shared/types/Entry';
import type { MonthReport } from '../../../shared/types/MonthReport';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Sem conexão com a API. Verifique se a aplicação está em execução.');
  }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Não foi possível concluir a operação.');
  return payload as T;
}

export function loadMonth(month: string, signal?: AbortSignal): Promise<MonthReport> {
  return request(`/api/entries?month=${encodeURIComponent(month)}`, { signal });
}

export function saveEntry(input: EntryInput): Promise<Entry> {
  return request('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Moneta-Request': '1' },
    body: JSON.stringify(input),
  });
}
