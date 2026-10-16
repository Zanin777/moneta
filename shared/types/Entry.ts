export interface Entry {
  id: string;
  kind: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
}
