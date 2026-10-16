import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { parseMoney } from '../../../shared/money';
import { validateEntry } from '../../../shared/validation';
import { saveEntry } from '../services/entries';
import type { EntryFormState } from '../types/EntryFormState';

export function useEntryForm(onSaved: (month: string) => void): EntryFormState {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const saving = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (saving.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setError('');
    setMessage('');
    try {
      const input = validateEntry({ ...fields, amount: parseMoney(String(fields.value)) });
      saving.current = true;
      setBusy(true);
      await saveEntry(input);
      form.reset();
      onSaved(input.date.slice(0, 7));
      setMessage('Lançamento salvo com sucesso.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar.');
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return { submit, busy, message, error };
}
