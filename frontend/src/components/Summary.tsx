import type { MonthReport } from '../../../shared/types/MonthReport';
import { formatMoney } from '../../../shared/money';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

export function Summary({ report }: { report: MonthReport }) {
  const cards = [
    { label: 'Receitas', value: report.income, icon: ArrowDownLeft, color: 'text-emerald-700' },
    { label: 'Despesas', value: report.expense, icon: ArrowUpRight, color: 'text-rose-700' },
    { label: 'Saldo do mês', value: report.balance, icon: Wallet, color: 'text-[#164e44]' },
  ];
  return (
    <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between text-sm text-slate-500">{card.label}<card.icon size={20} aria-hidden="true" /></div>
          <p className={`text-2xl font-semibold tracking-tight ${card.color}`}>{formatMoney(card.value)}</p>
        </div>
      ))}
    </section>
  );
}
