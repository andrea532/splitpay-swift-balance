
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Expense, Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  currentGroup: Group | null;
  expenses: Expense[];
  transactions: Transaction[];
  login: (name: string) => void;
  logout: () => void;
  createGroup: (name: string) => string;
  joinGroup: (code: string) => boolean;
  addExpense: (amount: number, description: string) => void;
  payExpense: (expenseId: string, payerId: string) => void;
  calculateBalances: () => { [userId: string]: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('splitpay_user');
    const savedGroup = localStorage.getItem('splitpay_group');
    const savedExpenses = localStorage.getItem('splitpay_expenses');
    const savedTransactions = localStorage.getItem('splitpay_transactions');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedGroup) {
      setCurrentGroup(JSON.parse(savedGroup));
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('splitpay_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentGroup) {
      localStorage.setItem('splitpay_group', JSON.stringify(currentGroup));
    }
  }, [currentGroup]);

  useEffect(() => {
    localStorage.setItem('splitpay_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('splitpay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const login = (name: string) => {
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      balance: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    setCurrentUser(user);
    
    toast({
      title: `Benvenuto, ${name}! 👋`,
      description: "Il tuo account è pronto per dividere le spese",
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    setExpenses([]);
    setTransactions([]);
    localStorage.removeItem('splitpay_user');
    localStorage.removeItem('splitpay_group');
    localStorage.removeItem('splitpay_expenses');
    localStorage.removeItem('splitpay_transactions');
    
    toast({
      title: "Logout effettuato",
      description: "A presto! 👋",
    });
  };

  const createGroup = (name: string): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group: Group = {
      id: `group_${Date.now()}`,
      name,
      code,
      members: currentUser ? [currentUser] : [],
      createdAt: new Date()
    };
    
    setCurrentGroup(group);
    
    toast({
      title: `Gruppo "${name}" creato! 🎉`,
      description: `Codice gruppo: ${code}`,
    });
    
    return code;
  };

  const joinGroup = (code: string): boolean => {
    // In a real app, this would fetch the group from a backend
    // For demo purposes, we'll create a mock group
    if (code.length === 6 && currentUser) {
      const group: Group = {
        id: `group_${Date.now()}`,
        name: `Gruppo ${code}`,
        code,
        members: [currentUser],
        createdAt: new Date()
      };
      
      setCurrentGroup(group);
      
      toast({
        title: `Entrato nel gruppo ${code}! ✅`,
        description: "Ora puoi iniziare a dividere le spese",
      });
      
      return true;
    }
    
    toast({
      title: "Codice non valido",
      description: "Controlla il codice e riprova",
      variant: "destructive"
    });
    
    return false;
  };

  const addExpense = (amount: number, description: string) => {
    if (!currentUser || !currentGroup) return;

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      groupId: currentGroup.id,
      amount,
      description,
      paidBy: '',
      participants: [currentUser.id],
      createdAt: new Date(),
      createdBy: currentUser.id
    };

    setExpenses(prev => [...prev, expense]);

    const transaction: Transaction = {
      id: `transaction_${Date.now()}`,
      type: 'expense',
      amount,
      description,
      date: new Date(),
      status: 'pending'
    };

    setTransactions(prev => [...prev, transaction]);

    toast({
      title: `Spesa aggiunta: €${amount}`,
      description: description || "Spesa generica",
    });
  };

  const payExpense = (expenseId: string, payerId: string) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, paidBy: payerId }
          : expense
      )
    );

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const transaction: Transaction = {
        id: `transaction_${Date.now()}`,
        type: 'payment',
        amount: expense.amount,
        description: `Pagamento: ${expense.description}`,
        date: new Date(),
        from: payerId,
        status: 'completed'
      };

      setTransactions(prev => [...prev, transaction]);

      toast({
        title: "Pagamento registrato! 💳",
        description: `€${expense.amount} pagato`,
      });
    }
  };

  const calculateBalances = (): { [userId: string]: number } => {
    const balances: { [userId: string]: number } = {};
    
    if (!currentGroup) return balances;

    // Initialize balances for all members
    currentGroup.members.forEach(member => {
      balances[member.id] = 0;
    });

    // Calculate balances based on expenses
    expenses.forEach(expense => {
      if (expense.paidBy && expense.participants.length > 0) {
        const sharePerPerson = expense.amount / expense.participants.length;
        
        // Person who paid gets credit
        balances[expense.paidBy] += expense.amount;
        
        // All participants (including payer) get debited their share
        expense.participants.forEach(participantId => {
          balances[participantId] -= sharePerPerson;
        });
      }
    });

    return balances;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentGroup,
      expenses,
      transactions,
      login,
      logout,
      createGroup,
      joinGroup,
      addExpense,
      payExpense,
      calculateBalances
    }}>
      {children}
    </AppContext.Provider>
  );
};
