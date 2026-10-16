import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Entry } from '../../shared/types/Entry.ts';
import type { EntryInput } from '../../shared/types/EntryInput.ts';
import type { Repository } from '../types/Repository';

export function createRepository(filename: string): Repository {
  const database = new DatabaseSync(filename);
  database.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS simple_entries (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('income','expense')),
      description TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL, date TEXT NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS entries_date ON simple_entries(date);`);
  const insert = database.prepare(
    'INSERT INTO simple_entries VALUES (?, ?, ?, ?, ?, ?)',
  );
  const select = database.prepare(
    'SELECT * FROM simple_entries WHERE date >= ? AND date <= ? ORDER BY date DESC, rowid DESC',
  );
  return {
    add(input: EntryInput): Entry {
      const id = randomUUID();
      insert.run(id, input.kind, input.description, input.amount, input.category, input.date);
      return { id, ...input };
    },
    list(month: string): Entry[] {
      return select.all(`${month}-01`, `${month}-31`) as unknown as Entry[];
    },
    close(): void {
      database.close();
    },
  };
}
