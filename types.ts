
import { AccountType, TransactionType } from './constants';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  sourceAccountId?: string;
  destinationAccountId?: string;
  amount: number;
  description?: string;
  date: string; // ISO string format YYYY-MM-DD
}

export type FormDataAccount = Omit<Account, 'id' | 'currentBalance'>;
export type FormDataTransaction = Omit<Transaction, 'id'>;
