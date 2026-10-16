import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useMonth } from '../hooks/useMonth';
import { EntryForm } from '../components/EntryForm';
import { EntryList } from '../components/EntryList';
import { Summary } from '../components/Summary';

export function FinanceView() {
  const [month, setMonth] = useState(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).format(new Date()).slice(0, 7));
  const [revision, setRevision] = useState(0);
  const { report, error } = useMonth(month, revision);
  function saved(selected: string): void {
    setMonth(selected);
    setRevision((value) => value + 1);
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-5"><Wallet className="text-[#164e44]" aria-hidden="true" /><span className="text-xl font-bold tracking-[.15em]">MONETA</span><span className="ml-auto text-xs text-slate-500">FINANÇAS PESSOAIS</span></div></header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 text-xs font-semibold tracking-[.2em] text-emerald-800">CADA LANÇAMENTO CONTA</p><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Seu mês em equilíbrio.</h1><p className="mt-3 text-slate-500">Uma visão simples do seu dinheiro, sem complicação.</p></div><label className="grid gap-2 text-sm font-medium">Mês consultado<input type="month" value={month} min="1000-01" max="9999-12" onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label></div>
        <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          <EntryForm month={month} onSaved={saved} />
          <div className="grid gap-6" aria-busy={!report && !error}>
            {error && <div role="alert" className="rounded-2xl bg-red-50 p-6 text-red-800">{error}<button className="ml-3 underline" onClick={() => setRevision((value) => value + 1)}>Tentar novamente</button></div>}
            {!report && !error && <p role="status" className="p-6">Consultando seus lançamentos…</p>}
            {report && <><Summary report={report} /><EntryList entries={report.entries} /></>}
          </div>
        </div>
        <footer className="mt-10 text-center text-xs text-slate-500">Seus registros ficam salvos neste computador.</footer>
      </main>
    </div>
  );
}
