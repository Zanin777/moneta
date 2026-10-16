import { Plus } from 'lucide-react';
import { useEntryForm } from '../hooks/useEntryForm';
import { EntryFields } from './EntryFields';

export function EntryForm({ month, onSaved }: { month: string; onSaved: (month: string) => void }) {
  const state = useEntryForm(onSaved);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8" aria-labelledby="new-entry">
      <h2 id="new-entry" className="mb-1 text-xl font-semibold">Novo lançamento</h2>
      <p className="mb-7 text-sm text-slate-500">Registre o que entra e o que sai.</p>
      <form onSubmit={state.submit} aria-busy={state.busy}>
        <fieldset disabled={state.busy} className="min-w-0">
          <EntryFields month={month} />
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#164e44] px-5 py-3.5 font-semibold text-white transition hover:bg-[#216a5c]" type="submit">
            <Plus size={18} aria-hidden="true" />{state.busy ? 'Salvando…' : 'Adicionar lançamento'}
          </button>
        </fieldset>
        {state.message && <p role="status" className="mt-4 text-sm text-emerald-800">{state.message}</p>}
        {state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}
      </form>
    </section>
  );
}
