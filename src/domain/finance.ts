/** Monetary values are safe integer cents. All authoritative writes belong on the future backend. */
export type Cents = number & { readonly __brand: 'Cents' };
export function cents(value: number): Cents {
  if (!Number.isSafeInteger(value)) throw new Error('Valor monetário fora do intervalo seguro.');
  return value as Cents;
}
export function parseBRL(input: string): Cents {
  const value = input.trim();
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) throw new Error('Use um valor como 1.250,50.');
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace('-', '').replaceAll('.', '').split(',');
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Valor monetário fora do intervalo seguro.');
  return cents(Number(negative ? -result : result));
}
export function formatBRL(value: Cents): string {
  const integer = BigInt(cents(value));
  const absolute = integer < 0n ? -integer : integer;
  const whole = (absolute / 100n).toLocaleString('pt-BR');
  return `${integer < 0n ? '−' : ''}R$ ${whole},${String(absolute % 100n).padStart(2, '0')}`;
}
export interface Account { id: string; ownerId: string; name: string; openingBalance: Cents }
interface BaseMovement { id: string; ownerId: string; amount: Cents; date: string; status: 'pending' | 'settled'; accountId: string }
export type Movement = BaseMovement & ({ type: 'income' | 'expense'; categoryId: string } | { type: 'transfer'; destinationId: string });
function safeAdd(left: Cents, right: number): Cents { return cents(left + right); }
export function validateMovement(movement: Movement, accounts: readonly Account[]): void {
  if (cents(movement.amount) <= 0) throw new Error('O valor deve ser positivo.');
  const source = accounts.find(a => a.id === movement.accountId && a.ownerId === movement.ownerId);
  if (!source) throw new Error('Conta de origem inválida.');
  if (movement.type === 'transfer') {
    if (movement.destinationId === movement.accountId) throw new Error('Selecione contas diferentes.');
    if (!accounts.some(a => a.id === movement.destinationId && a.ownerId === movement.ownerId)) throw new Error('Conta de destino inválida.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(movement.date) || !Number.isFinite(Date.parse(movement.date)) || new Date(movement.date).toISOString().slice(0, 10) !== movement.date) throw new Error('Data inválida.');
}
export function summarize(accounts: readonly Account[], movements: readonly Movement[], ownerId: string, month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Período inválido.');
  const own = accounts.filter(a => a.ownerId === ownerId);
  const balances = new Map(own.map(a => [a.id, cents(a.openingBalance)]));
  let income = cents(0), expense = cents(0);
  const seen = new Set<string>();
  for (const movement of movements.filter(t => t.ownerId === ownerId)) {
    if (seen.has(movement.id)) throw new Error('Identificador de transação duplicado.');
    seen.add(movement.id);
    validateMovement(movement, own);
    if (movement.status === 'pending' || movement.date > `${month}-31`) continue;
    const amount = movement.amount;
    balances.set(movement.accountId, safeAdd(balances.get(movement.accountId)!, movement.type === 'income' ? amount : -amount));
    if (movement.type === 'transfer') balances.set(movement.destinationId, safeAdd(balances.get(movement.destinationId)!, amount));
    if (movement.date.startsWith(month)) {
      if (movement.type === 'income') income = safeAdd(income, amount);
      if (movement.type === 'expense') expense = safeAdd(expense, amount);
    }
  }
  return { balances, income, expense, result: safeAdd(income, -expense), total: [...balances.values()].reduce((a, b) => safeAdd(a, b), cents(0)) };
}
export function splitInstallments(amount: Cents, count: number): Cents[] {
  if (cents(amount) <= 0 || !Number.isSafeInteger(count) || count < 1 || count > 360 || count > amount) throw new Error('Parcelamento inválido.');
  const base = Math.floor(amount / count), remainder = amount % count;
  return Array.from({ length: count }, (_, i) => cents(base + (i < remainder ? 1 : 0)));
}
