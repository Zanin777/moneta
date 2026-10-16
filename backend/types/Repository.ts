import type { Entry } from '../../shared/types/Entry';
import type { EntryInput } from '../../shared/types/EntryInput';

export interface Repository {
  add(input: EntryInput): Entry;
  list(month: string): Entry[];
  close(): void;
}
