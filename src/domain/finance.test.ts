import { describe, expect, it } from 'vitest';
import { cents, formatBRL, parseBRL, splitInstallments, summarize, type Account, type Movement } from './finance';
const accounts: Account[] = [{ id:'a', ownerId:'u', name:'Principal', openingBalance:cents(100000) }, { id:'b', ownerId:'u', name:'Reserva', openingBalance:cents(0) }, { id:'c', ownerId:'other', name:'Outra', openingBalance:cents(999999) }];
const entry = (overrides: Partial<Movement> = {}): Movement => ({ id:'t', ownerId:'u', amount:cents(5000), date:'2026-10-14', status:'settled', accountId:'a', type:'expense', categoryId:'food', ...overrides } as Movement);
describe('integridade monetária', () => {
  it('converte reais sem multiplicação de decimais', () => { expect(parseBRL('1.234,56')).toBe(123456); expect(parseBRL('0,29')).toBe(29); expect(parseBRL('-10,5')).toBe(-1050); });
  it.each(['1.23', '1e5', 'NaN', '1,234', '', '12.34,00'])('rejeita entrada ambígua %s', input => expect(() => parseBRL(input)).toThrow());
  it('rejeita precisão insegura', () => { expect(() => cents(0.1)).toThrow(); expect(() => cents(Number.MAX_SAFE_INTEGER + 1)).toThrow(); expect(() => parseBRL('900719925474099,00')).toThrow(); });
  it('formata centavos preservando precisão', () => { expect(formatBRL(cents(123456))).toBe('R$ 1.234,56'); expect(formatBRL(cents(-1))).toBe('−R$ 0,01'); });
  it('distribui o resto de parcelas sem perder centavos', () => { expect(splitInstallments(cents(10000),3)).toEqual([3334,3333,3333]); expect(splitInstallments(cents(1),1)).toEqual([1]); });
  it('rejeita parcelas inválidas', () => { expect(() => splitInstallments(cents(1),2)).toThrow(); expect(() => splitInstallments(cents(100),0)).toThrow(); });
});
describe('projeção do livro financeiro', () => {
  it('transferência conserva patrimônio e não gera receita/despesa', () => { const s = summarize(accounts,[entry({ type:'transfer', destinationId:'b' })],'u','2026-10'); expect(s.total).toBe(100000); expect(s.balances.get('a')).toBe(95000); expect(s.balances.get('b')).toBe(5000); expect(s.income).toBe(0); expect(s.expense).toBe(0); });
  it('ignora pendentes', () => { const s = summarize(accounts,[entry({ status:'pending' })],'u','2026-10'); expect(s.total).toBe(100000); expect(s.expense).toBe(0); });
  it('calcula entradas, saídas e resultado', () => { const s = summarize(accounts,[entry(),entry({ id:'i',type:'income',amount:cents(8000) })],'u','2026-10'); expect(s.total).toBe(103000); expect(s.result).toBe(3000); expect(s.income).toBe(8000); expect(s.expense).toBe(5000); });
  it('preserva histórico no saldo e filtra o resultado do mês', () => { const s = summarize(accounts,[entry({ date:'2026-09-12' }),entry({ id:'future',date:'2026-11-01' })],'u','2026-10'); expect(s.total).toBe(95000); expect(s.expense).toBe(0); });
  it('não inclui contas ou movimentos de outro proprietário', () => { const s = summarize(accounts,[entry({ ownerId:'other',accountId:'c' })],'u','2026-10'); expect(s.total).toBe(100000); expect(s.balances.has('c')).toBe(false); });
  it('rejeita transferência para outro proprietário ou a mesma conta', () => { expect(() => summarize(accounts,[entry({type:'transfer',destinationId:'c'})],'u','2026-10')).toThrow(); expect(() => summarize(accounts,[entry({type:'transfer',destinationId:'a'})],'u','2026-10')).toThrow(); });
  it('rejeita duplicações e overflow', () => { expect(() => summarize(accounts,[entry(),entry()],'u','2026-10')).toThrow(); expect(() => summarize([{...accounts[0],openingBalance:cents(Number.MAX_SAFE_INTEGER)}],[entry({type:'income'})],'u','2026-10')).toThrow(); });
  it('rejeita datas normalizadas e valores negativos', () => { expect(() => summarize(accounts,[entry({date:'2026-02-30'})],'u','2026-10')).toThrow(); expect(() => summarize(accounts,[entry({amount:cents(-1)})],'u','2026-10')).toThrow(); });
  it('recalcula corretamente após edição e exclusão', () => { expect(summarize(accounts,[entry({amount:cents(1000)})],'u','2026-10').total).toBe(99000); expect(summarize(accounts,[],'u','2026-10').total).toBe(100000); });
});
