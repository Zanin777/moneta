import { afterEach, expect, it, vi } from 'vitest';
import { loadMonth, saveEntry } from '../services/entries';

afterEach(() => vi.unstubAllGlobals());

it('TU-02 trata erro de rede e HTTP com mensagem clara', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  await expect(loadMonth('2026-10')).rejects.toThrow('Sem conexão');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Mês inválido' }) }));
  await expect(loadMonth('x')).rejects.toThrow('Mês inválido');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
  await expect(loadMonth('x')).rejects.toThrow('Não foi possível');
});

it('TU-02 serializa POST em centavos e escapa mês', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: '1' }) });
  vi.stubGlobal('fetch', fetcher);
  const input = { kind: 'income' as const, amount: 30, description: 'Teste', category: 'Outros', date: '2026-10-01' };
  expect(await saveEntry(input)).toEqual({ id: '1' });
  expect(fetcher).toHaveBeenCalledWith('/api/entries', expect.objectContaining({ body: JSON.stringify(input) }));
  await loadMonth('2026&11');
  expect(fetcher).toHaveBeenLastCalledWith('/api/entries?month=2026%2611', expect.any(Object));
});
