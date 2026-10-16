import type { FormEvent } from 'react';

export interface EntryFormState {
  busy: boolean;
  message: string;
  error: string;
  submit(event: FormEvent<HTMLFormElement>): Promise<void>;
}
