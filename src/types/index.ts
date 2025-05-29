export interface User {
  id: string;
  name: string;
  avatar?: string;
  balance: number;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: User[];
  createdAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string;
  participants: string[];
  createdAt: Date;
  createdBy: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'settlement' | 'payment';
  amount: number;
  description: string;
  date: Date;
  from?: string;
  to?: string;
  status: 'pending' | 'completed';
}