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
  addExpense: (amount: number, description: string, paidBy?: string, participants?: string[]) => void;
  payExpense: (expenseId: string, payerId: string) => void;
  calculateBalances: () => { [userId: string]: number };
  getGroupExpenses: () => Expense[];
  settleDebt: (fromUserId: string, toUserId: string, amount: number) => void;
  addMemberToGroup: (memberName: string) => void;
  removeMemberFromGroup: (memberId: string) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('splitpay_user');
    const savedGroup = localStorage.getItem('splitpay_group');
    const savedExpenses = localStorage.getItem('splitpay_expenses');
    const savedTransactions = localStorage.getItem('splitpay_transactions');
    const savedSettlements = localStorage.getItem('splitpay_settlements');

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
    setSettlements([]);
    localStorage.removeItem('splitpay_user');
    localStorage.removeItem('splitpay_group');
    localStorage.removeItem('splitpay_expenses');
    localStorage.removeItem('splitpay_transactions');
    localStorage.removeItem('splitpay_settlements');
    
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
      const mockMembers = [
        currentUser,
        {
          id: `user_${Date.now() + 1}`,
          name: 'Marco',
          balance: 0,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Marco`
        },
        {
          id: `user_${Date.now() + 2}`,
          name: 'Laura',
          balance: 0,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Laura`
        }
      ];

      const group: Group = {
        id: `group_${Date.now()}`,
        name: `Gruppo ${code}`,
        code,
        members: mockMembers,
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

  const addMemberToGroup = (memberName: string) => {
    if (!currentGroup) return;

    const newMember: User = {
      id: `user_${Date.now()}`,
      name: memberName,
      balance: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`
    };

    const updatedGroup = {
      ...currentGroup,
      members: [...currentGroup.members, newMember]
    };

    setCurrentGroup(updatedGroup);

    toast({
      title: `${memberName} aggiunto al gruppo! 👥`,
      description: "Nuovo membro aggiunto con successo",
    });
  };

  const removeMemberFromGroup = (memberId: string) => {
    if (!currentGroup) return;

    const updatedGroup = {
      ...currentGroup,
      members: currentGroup.members.filter(m => m.id !== memberId)
    };

    setCurrentGroup(updatedGroup);

    toast({
      title: "Membro rimosso",
      description: "Il membro è stato rimosso dal gruppo",
    });
  };

  const addExpense = (amount: number, description: string, paidBy?: string, participants?: string[]) => {
    if (!currentUser || !currentGroup) return;

    const payerId = paidBy || currentUser.id;
    const participantIds = participants || currentGroup.members.map(m => m.id);

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      groupId: currentGroup.id,
      amount,
      description,
      paidBy: payerId,
      participants: participantIds,
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
      from: payerId,
      status: 'completed'
    };

    setTransactions(prev => [...prev, transaction]);

    const payer = currentGroup.members.find(m => m.id === payerId);
    toast({
      title: `Spesa aggiunta: €${amount.toFixed(2)}`,
      description: `Pagata da ${payer?.name || 'Unknown'} - ${description}`,
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
      description: `Saldo debito`,
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
      description: `${fromUser?.name} ha pagato €${amount.toFixed(2)} a ${toUser?.name}`,
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
    expenses.forEach(expense => {
      if (expense.groupId === currentGroup.id && expense.paidBy && expense.participants.length > 0) {
        const sharePerPerson = expense.amount / expense.participants.length;
        
        // Person who paid gets credit
        balances[expense.paidBy] += expense.amount;
        
        // All participants (including payer) get debited their share
        expense.participants.forEach(participantId => {
          balances[participantId] -= sharePerPerson;
        });
      }
    });

    // Apply settlements
    settlements.forEach(settlement => {
      if (settlement.groupId === currentGroup.id) {
        balances[settlement.from] += settlement.amount;
        balances[settlement.to] -= settlement.amount;
      }
    });

    return balances;
  };

  const getGroupExpenses = (): Expense[] => {
    if (!currentGroup) return [];
    return expenses.filter(expense => expense.groupId === currentGroup.id);
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
      payExpense,
      calculateBalances,
      getGroupExpenses,
      settleDebt,
      addMemberToGroup,
      removeMemberFromGroup
    }}>
      {children}
    </AppContext.Provider>
  );
};
