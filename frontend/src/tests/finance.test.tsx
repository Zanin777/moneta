import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinanceView } from '../views/FinanceView';
import { EntryForm } from '../components/EntryForm';
import { loadMonth, saveEntry } from '../services/entries';

vi.mock('../services/entries', () => ({ loadMonth: vi.fn(), saveEntry: vi.fn() }));
const empty = { entries: [], income: 0, expense: 0, balance: 0 };

beforeEach(() => {
  vi.mocked(loadMonth).mockResolvedValue(empty);
  vi.mocked(saveEntry).mockResolvedValue({ id: '1', kind: 'income', description: 'Salário', category: 'Trabalho', amount: 10, date: '2026-10-15' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('TU-02 mostra mês vazio e consulta outro mês', async () => {
  render(<FinanceView />);
  expect(await screen.findByText(/Nenhum lançamento/)).toBeTruthy();
  expect(screen.getAllByText(/R\$\s*0,00/)).toHaveLength(3);
  fireEvent.change(screen.getByLabelText('Mês consultado'), { target: { value: '2025-12' } });
  await waitFor(() => expect(loadMonth).toHaveBeenLastCalledWith('2025-12', expect.any(AbortSignal)));
});

it('TU-02 mostra ambos os tipos e os totais recebidos', async () => {
  vi.mocked(loadMonth).mockResolvedValue({ income: 100, expense: 30, balance: 70, entries: [
    { id: '1', kind: 'income', description: 'Salário', category: 'Trabalho', amount: 100, date: '2026-10-01' },
    { id: '2', kind: 'expense', description: 'Café', category: 'Alimentação', amount: 30, date: '2026-10-02' },
  ] });
  render(<FinanceView />);
  expect(await screen.findByText('Café')).toBeTruthy();
  expect(screen.getByText('Trabalho · 01/10/2026')).toBeTruthy();
  expect(screen.getByText(/R\$\s*0,70/)).toBeTruthy();
});

it('TU-02 exibe erro na consulta e permite tentar novamente', async () => {
  vi.mocked(loadMonth).mockRejectedValueOnce(new Error('API indisponível'));
  render(<FinanceView />);
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('API indisponível'));
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText(/Nenhum lançamento/)).toBeTruthy();
});

async function fillForm(value: string): Promise<void> {
  await userEvent.type(screen.getByLabelText('Descrição'), 'Mercado');
  await userEvent.type(screen.getByLabelText('Valor (R$)'), value);
  await userEvent.type(screen.getByLabelText('Categoria'), 'Alimentação');
}

it('TU-02 salva centavos, anuncia sucesso e atualiza mês', async () => {
  const saved = vi.fn();
  render(<EntryForm month="2026-10" onSaved={saved} />);
  await fillForm('0,30');
  await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
  expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Lançamento salvo com sucesso.');
  expect(saveEntry).toHaveBeenCalledWith(expect.objectContaining({ amount: 30, kind: 'expense' }));
  expect(saved).toHaveBeenCalledWith('2026-10');
});

it('TU-02 rejeita valor não positivo sem chamar API', async () => {
  render(<EntryForm month="2026-10" onSaved={vi.fn()} />);
  await fillForm('-1');
  await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(saveEntry).not.toHaveBeenCalled();
});

it('TU-02 mantém dados preenchidos se o salvamento falhar', async () => {
  vi.mocked(saveEntry).mockRejectedValueOnce(new Error('Falha ao salvar'));
  render(<EntryForm month="2026-10" onSaved={vi.fn()} />);
  await fillForm('10');
  await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Falha ao salvar');
  expect(screen.getByLabelText('Descrição')).toHaveProperty('value', 'Mercado');
});
