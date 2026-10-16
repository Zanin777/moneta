import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function add(page: Page, input: { kind: string; description: string; value: string }): Promise<void> {
  await page.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption(input.kind);
  await page.getByLabel('Descrição', { exact: true }).fill(input.description);
  await page.getByLabel('Valor (R$)', { exact: true }).fill(input.value);
  await page.getByLabel('Categoria', { exact: true }).fill('Outros');
  await page.getByLabel('Data', { exact: true }).fill('2026-10-15');
  await page.getByRole('button', { name: 'Adicionar lançamento' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Lançamento salvo com sucesso.' })).toBeVisible();
  await expect(page.getByRole('list').getByText(input.description, { exact: true })).toBeVisible();
}

test('E2E-01 registra, consulta, recarrega e adapta ao celular', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mês consultado').fill('2026-10');
  await add(page, { kind: 'income', description: 'Receita de teste', value: '0,30' });
  await add(page, { kind: 'expense', description: 'Despesa de teste', value: '0,10' });
  const summary = page.getByRole('region', { name: 'Resumo financeiro' });
  await expect(summary).toContainText('R$ 0,20');
  await page.reload();
  await page.getByLabel('Mês consultado').fill('2026-10');
  await expect(page.getByText('Receita de teste', { exact: true })).toBeVisible();
  await expect(summary).toContainText('R$ 0,20');
  await page.screenshot({ path: 'docs/simple-desktop.png', fullPage: true });
  await page.getByLabel('Mês consultado').fill('2031-02');
  await expect(page.getByText(/Nenhum lançamento/)).toBeVisible();
  await expect(summary.getByText('R$ 0,00', { exact: true })).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Adicionar lançamento' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/simple-mobile.png', fullPage: true });
});
