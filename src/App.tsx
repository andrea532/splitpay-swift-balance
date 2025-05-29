import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Expense, Transaction, Settlement } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  currentGroup: Group | null;
  expenses: Expense[];
  transactions: Transaction[];
  settlements: Settlement[];
  login: (name: string) => void;
  logout: () => void;
  createGroup: (name: string) => string;
  joinGroup: (code: string) => boolean;
  addExpense: (amount: number, description: string, paidBy: string, participants: string[]) => void;
  addMemberToGroup: (name: string) => void;
  settleDebt: (fromUserId: string, toUserId: string, amount: number) => void;
  calculateBalances: () => { [userId: string]: number };
  getDebts: () => { from: User; to: User; amount: number }[];
  getGroupExpenses: () => Expense[];
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
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('splitpay_user');
    const savedGroup = localStorage.getItem('splitpay_group');
    const savedExpenses = localStorage.getItem('splitpay_expenses');
    const savedTransactions = localStorage.getItem('splitpay_transactions');
    const savedSettlements = localStorage.getItem('splitpay_settlements');
    const savedGroups = localStorage.getItem('splitpay_groups');

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
    if (savedSettlements) {
      setSettlements(JSON.parse(savedSettlements));
    }
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
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

  useEffect(() => {
    localStorage.setItem('splitpay_settlements', JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem('splitpay_groups', JSON.stringify(groups));
  }, [groups]);

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
    localStorage.removeItem('splitpay_user');
    localStorage.removeItem('splitpay_group');
    
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
    setGroups(prev => [...prev, group]);
    
    toast({
      title: `Gruppo "${name}" creato! 🎉`,
      description: `Codice gruppo: ${code}`,
    });
    
    return code;
  };

  const joinGroup = (code: string): boolean => {
    // Check if group exists in saved groups
    const existingGroup = groups.find(g => g.code === code);
    
    if (existingGroup && currentUser) {
      // Check if user is already a member
      const isAlreadyMember = existingGroup.members.some(m => m.id === currentUser.id);
      
      if (!isAlreadyMember) {
        // Add user to group
        const updatedGroup = {
          ...existingGroup,
          members: [...existingGroup.members, currentUser]
        };
        
        setGroups(prev => prev.map(g => g.id === existingGroup.id ? updatedGroup : g));
        setCurrentGroup(updatedGroup);
      } else {
        setCurrentGroup(existingGroup);
      }
      
      toast({
        title: `Entrato nel gruppo ${existingGroup.name}! ✅`,
        description: "Ora puoi iniziare a dividere le spese",
      });
      
      return true;
    }
    
    // If no group exists with this code and it's valid format, create it
    if (code.length === 6 && currentUser) {
      const group: Group = {
        id: `group_${Date.now()}`,
        name: `Gruppo ${code}`,
        code,
        members: [currentUser],
        createdAt: new Date()
      };
      
      setCurrentGroup(group);
      setGroups(prev => [...prev, group]);
      
      toast({
        title: `Entrato nel gruppo ${code}! ✅`,
        description: "Nuovo gruppo creato",
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

  const addMemberToGroup = (name: string) => {
    if (!currentGroup) return;

    const newMember: User = {
      id: `user_${Date.now()}_${Math.random()}`,
      name,
      balance: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    const updatedGroup = {
      ...currentGroup,
      members: [...currentGroup.members, newMember]
    };

    setCurrentGroup(updatedGroup);
    setGroups(prev => prev.map(g => g.id === currentGroup.id ? updatedGroup : g));

    toast({
      title: `${name} aggiunto al gruppo! 👥`,
      description: "Nuovo membro aggiunto con successo",
    });
  };

  const addExpense = (amount: number, description: string, paidBy: string, participants: string[]) => {
    if (!currentUser || !currentGroup) return;

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      groupId: currentGroup.id,
      amount,
      description,
      paidBy,
      participants,
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
      from: paidBy,
      status: 'completed'
    };

    setTransactions(prev => [...prev, transaction]);

    const payer = currentGroup.members.find(m => m.id === paidBy);
    toast({
      title: `Spesa aggiunta: €${amount}`,
      description: `Pagata da ${payer?.name || 'Sconosciuto'}`,
    });
  };

  const settleDebt = (fromUserId: string, toUserId: string, amount: number) => {
    if (!currentGroup) return;

    const settlement: Settlement = {
      id: `settlement_${Date.now()}`,
      groupId: currentGroup.id,
      from: fromUserId,
      to: toUserId,
      amount,
      createdAt: new Date()
    };

    setSettlements(prev => [...prev, settlement]);

    const transaction: Transaction = {
      id: `transaction_${Date.now()}`,
      type: 'settlement',
      amount,
      description: 'Saldo debito',
      date: new Date(),
      from: fromUserId,
      to: toUserId,
      status: 'completed'
    };

    setTransactions(prev => [...prev, transaction]);

    const fromUser = currentGroup.members.find(m => m.id === fromUserId);
    const toUser = currentGroup.members.find(m => m.id === toUserId);

    toast({
      title: "Debito saldato! 💰",
      description: `${fromUser?.name} ha pagato €${amount} a ${toUser?.name}`,
    });
  };

  const calculateBalances = (): { [userId: string]: number } => {
    const balances: { [userId: string]: number } = {};
    
    if (!currentGroup) return balances;

    // Initialize balances for all members
    currentGroup.members.forEach(member => {
      balances[member.id] = 0;
    });

    // Calculate balances based on expenses
    const groupExpenses = expenses.filter(e => e.groupId === currentGroup.id);
    
    groupExpenses.forEach(expense => {
      if (expense.paidBy && expense.participants.length > 0) {
        const sharePerPerson = expense.amount / expense.participants.length;
        
        // Person who paid gets credit
        balances[expense.paidBy] += expense.amount;
        
        // All participants get debited their share
        expense.participants.forEach(participantId => {
          balances[participantId] -= sharePerPerson;
        });
      }
    });

    // Apply settlements
    const groupSettlements = settlements.filter(s => s.groupId === currentGroup.id);
    
    groupSettlements.forEach(settlement => {
      balances[settlement.from] += settlement.amount;
      balances[settlement.to] -= settlement.amount;
    });

    return balances;
  };

  const getDebts = (): { from: User; to: User; amount: number }[] => {
    if (!currentGroup) return [];

    const balances = calculateBalances();
    const debts: { from: User; to: User; amount: number }[] = [];

    // Simple debt resolution algorithm
    const creditors: { user: User; amount: number }[] = [];
    const debtors: { user: User; amount: number }[] = [];

    currentGroup.members.forEach(member => {
      const balance = balances[member.id] || 0;
      if (balance > 0.01) {
        creditors.push({ user: member, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ user: member, amount: Math.abs(balance) });
      }
    });

    // Sort by amount
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Match debtors with creditors
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const amount = Math.min(creditor.amount, debtor.amount);
      
      if (amount > 0.01) {
        debts.push({
          from: debtor.user,
          to: creditor.user,
          amount: Math.round(amount * 100) / 100
        });
      }

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return debts;
  };

  const getGroupExpenses = (): Expense[] => {
    if (!currentGroup) return [];
    return expenses.filter(e => e.groupId === currentGroup.id);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentGroup,
      expenses,
      transactions,
      settlements,
      login,
      logout,
      createGroup,
      joinGroup,
      addExpense,
      addMemberToGroup,
      settleDebt,
      calculateBalances,
      getDebts,
      getGroupExpenses
    }}>
      {children}
    </AppContext.Provider>
  );
};