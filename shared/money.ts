const MAX_CENTS = 1_000_000_000;
const CENTS_PER_REAL = 100n;

export function parseMoney(value: string): number {
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value.trim())) {
    throw new Error('Informe um valor positivo, como 1250,50 (sem pontos de milhar).');
  }
  const [whole, decimal = ''] = value.trim().replace(',', '.').split('.');
  const cents = BigInt(whole) * CENTS_PER_REAL + BigInt(decimal.padEnd(2, '0'));
  if (cents <= 0n || cents > BigInt(MAX_CENTS)) {
    throw new Error('O valor deve ser maior que zero e até R$ 10.000.000,00.');
  }
  return Number(cents);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(cents / Number(CENTS_PER_REAL));
}
