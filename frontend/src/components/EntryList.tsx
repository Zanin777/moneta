import type { Entry } from '../../../shared/types/Entry';
import { formatMoney } from '../../../shared/money';

export function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-8" aria-labelledby="entries-title">
      <div className="mb-6 flex items-center justify-between gap-4"><h2 id="entries-title" className="text-xl font-semibold">Lançamentos do mês</h2><span className="text-sm text-slate-500">{entries.length} registros</span></div>
      {entries.length === 0 && <div className="py-14 text-center"><p className="font-medium">Um novo mês, uma página em branco.</p><p className="mt-2 text-sm text-slate-500">Nenhum lançamento neste mês. Adicione o primeiro pelo formulário.</p></div>}
      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="min-w-0 flex-1"><p className="break-words font-medium">{entry.description}</p><p className="mt-1 break-words text-sm text-slate-500">{entry.category} · {entry.date.split('-').reverse().join('/')}</p></div>
            <div className="text-right"><p className={entry.kind === 'income' ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{formatMoney(entry.amount)}</p><p className="text-xs text-slate-500">{entry.kind === 'income' ? 'Receita' : 'Despesa'}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
