import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Expense, Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  currentGroup: Group | null;
  expenses: Expense[];
  transactions: Transaction[];
  groups: { [code: string]: Group };
  login: (name: string) => void;
  logout: () => void;
  createGroup: (name: string) => string;
  joinGroup: (code: string) => boolean;
  addExpense: (amount: number, description: string) => void;
  payExpense: (expenseId: string) => void;
  calculateBalances: () => { [userId: string]: number };
  getSettlements: () => { from: User; to: User; amount: number }[];
  syncCurrentGroup: () => void;
  updateCurrentGroup: (group: Group) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Shared database key
const SHARED_DB_KEY = 'splitpay_shared_db';

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
  const [groups, setGroups] = useState<{ [code: string]: Group }>({});

  // Simulate a shared database using localStorage
  const getSharedDatabase = () => {
    const dbString = localStorage.getItem(SHARED_DB_KEY);
    if (dbString) {
      try {
        return JSON.parse(dbString);
      } catch {
        return { groups: {}, expenses: [], transactions: [] };
      }
    }
    return { groups: {}, expenses: [], transactions: [] };
  };

  const updateSharedDatabase = (updates: any) => {
    const db = getSharedDatabase();
    const updatedDb = { ...db, ...updates };
    localStorage.setItem(SHARED_DB_KEY, JSON.stringify(updatedDb));
    
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: SHARED_DB_KEY,
      newValue: JSON.stringify(updatedDb),
      url: window.location.href
    }));
    
    return updatedDb;
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('splitpay_user');
    const savedGroup = localStorage.getItem('splitpay_group');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Load from shared database
    const sharedDb = getSharedDatabase();
    setGroups(sharedDb.groups || {});
    setExpenses(sharedDb.expenses || []);
    setTransactions(sharedDb.transactions || []);
    
    if (savedGroup) {
      const group = JSON.parse(savedGroup);
      // Check if group exists in shared database and update with latest data
      if (sharedDb.groups[group.code]) {
        const latestGroup = sharedDb.groups[group.code];
        setCurrentGroup(latestGroup);
        localStorage.setItem('splitpay_group', JSON.stringify(latestGroup));
      } else {
        setCurrentGroup(group);
      }
    }
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SHARED_DB_KEY && e.newValue) {
        const sharedDb = JSON.parse(e.newValue);
        setGroups(sharedDb.groups || {});
        setExpenses(sharedDb.expenses || []);
        setTransactions(sharedDb.transactions || []);
        
        // Update current group if it exists in the shared db
        if (currentGroup && sharedDb.groups[currentGroup.code]) {
          const updatedGroup = sharedDb.groups[currentGroup.code];
          setCurrentGroup(updatedGroup);
          localStorage.setItem('splitpay_group', JSON.stringify(updatedGroup));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentGroup?.code]);

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
    const sharedDb = getSharedDatabase();
    updateSharedDatabase({ 
      groups, 
      expenses: sharedDb.expenses || [],
      transactions: sharedDb.transactions || []
    });
  }, [groups]);

  useEffect(() => {
    const sharedDb = getSharedDatabase();
    updateSharedDatabase({ 
      groups: sharedDb.groups || {}, 
      expenses,
      transactions: sharedDb.transactions || []
    });
  }, [expenses]);

  useEffect(() => {
    const sharedDb = getSharedDatabase();
    updateSharedDatabase({ 
      groups: sharedDb.groups || {}, 
      expenses: sharedDb.expenses || [],
      transactions
    });
  }, [transactions]);

  const login = (name: string) => {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    const newGroups = { ...groups, [code]: group };
    setGroups(newGroups);
    
    toast({
      title: `Gruppo "${name}" creato! 🎉`,
      description: `Codice gruppo: ${code}`,
    });
    
    return code;
  };

  const joinGroup = (code: string): boolean => {
    if (code.length === 6 && currentUser) {
      const upperCode = code.toUpperCase();
      
      // First check shared database for the latest group data
      const sharedDb = getSharedDatabase();
      const existingGroup = sharedDb.groups[upperCode] || groups[upperCode];
      
      if (existingGroup) {
        // Check if user is already a member by both ID and name
        const isAlreadyMember = existingGroup.members.some(
          m => m.id === currentUser.id || m.name === currentUser.name
        );
        
        // Add current user to existing group if not already a member
        const updatedMembers = isAlreadyMember 
          ? existingGroup.members 
          : [...existingGroup.members, currentUser];
          
        const updatedGroup = { ...existingGroup, members: updatedMembers };
        
        setCurrentGroup(updatedGroup);
        const newGroups = { ...groups, [upperCode]: updatedGroup };
        setGroups(newGroups);
        
        if (!isAlreadyMember) {
          toast({
            title: `Entrato nel gruppo "${existingGroup.name}"! ✅`,
            description: `Ora siete in ${updatedMembers.length}`,
          });
        } else {
          toast({
            title: `Bentornato nel gruppo "${existingGroup.name}"!`,
            description: `${updatedMembers.length} membri nel gruppo`,
          });
        }
        
        return true;
      } else {
        // Create new group if code doesn't exist
        const group: Group = {
          id: `group_${Date.now()}`,
          name: `Gruppo ${code}`,
          code: upperCode,
          members: [currentUser],
          createdAt: new Date()
        };
        
        setCurrentGroup(group);
        const newGroups = { ...groups, [upperCode]: group };
        setGroups(newGroups);
        
        toast({
          title: `Nuovo gruppo creato! ✅`,
          description: "Condividi il codice con i tuoi amici",
        });
        
        return true;
      }
    }
    
    toast({
      title: "Codice non valido",
      description: "Il codice deve essere di 6 caratteri",
      variant: "destructive"
    });
    
    return false;
  };

  const syncCurrentGroup = () => {
    if (!currentGroup) return;
    
    const sharedDb = getSharedDatabase();
    if (sharedDb.groups[currentGroup.code]) {
      const latestGroup = sharedDb.groups[currentGroup.code];
      setCurrentGroup(latestGroup);
      localStorage.setItem('splitpay_group', JSON.stringify(latestGroup));
    }
  };

  const updateCurrentGroup = (group: Group) => {
    setCurrentGroup(group);
    localStorage.setItem('splitpay_group', JSON.stringify(group));
  };

  const addExpense = (amount: number, description: string) => {
    if (!currentUser || !currentGroup) {
      toast({
        title: "Errore",
        description: "Devi essere in un gruppo per aggiungere spese",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupId: currentGroup.id,
      amount,
      description,
      paidBy: currentUser.id,
      participants: currentGroup.members.map(m => m.id),
      createdAt: new Date(),
      createdBy: currentUser.id
    };

    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);

    const transaction: Transaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'expense',
      amount,
      description: `${currentUser.name} ha pagato: ${description}`,
      date: new Date(),
      from: currentUser.id,
      status: 'completed'
    };

    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);

    toast({
      title: `Spesa aggiunta: €${amount.toFixed(2)}`,
      description: description || "Spesa generica",
    });
  };

  const payExpense = (expenseId: string) => {
    if (!currentUser) return;

    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const transaction: Transaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment',
      amount: expense.amount / expense.participants.length,
      description: `Pagamento quota per: ${expense.description}`,
      date: new Date(),
      from: currentUser.id,
      to: expense.paidBy,
      status: 'completed'
    };

    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);

    toast({
      title: "Pagamento registrato! 💳",
      description: `€${transaction.amount.toFixed(2)} pagato`,
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
    expenses
      .filter(expense => expense.groupId === currentGroup.id)
      .forEach(expense => {
        if (expense.paidBy && expense.participants.length > 0) {
          const sharePerPerson = expense.amount / expense.participants.length;
          
          // Person who paid gets credit
          if (balances[expense.paidBy] !== undefined) {
            balances[expense.paidBy] += expense.amount;
          }
          
          // All participants get debited their share
          expense.participants.forEach(participantId => {
            if (balances[participantId] !== undefined) {
              balances[participantId] -= sharePerPerson;
            }
          });
        }
      });

    // Apply payments
    transactions
      .filter(t => t.type === 'payment' && t.from && t.to)
      .forEach(payment => {
        if (payment.from && payment.to) {
          if (balances[payment.from] !== undefined) {
            balances[payment.from] += payment.amount;
          }
          if (balances[payment.to] !== undefined) {
            balances[payment.to] -= payment.amount;
          }
        }
      });

    return balances;
  };

  const getSettlements = (): { from: User; to: User; amount: number }[] => {
    if (!currentGroup) return [];

    const balances = calculateBalances();
    const settlements: { from: User; to: User; amount: number }[] = [];
    
    // Create arrays of debtors and creditors
    const debtors: { user: User; amount: number }[] = [];
    const creditors: { user: User; amount: number }[] = [];
    
    currentGroup.members.forEach(member => {
      const balance = balances[member.id] || 0;
      if (balance < -0.01) { // owes money
        debtors.push({ user: member, amount: Math.abs(balance) });
      } else if (balance > 0.01) { // is owed money
        creditors.push({ user: member, amount: balance });
      }
    });
    
    // Sort by amount
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    // Calculate optimal settlements
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      if (settlementAmount > 0.01) {
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: settlementAmount
        });
      }
      
      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;
      
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    
    return settlements;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentGroup,
      expenses,
      transactions,
      groups,
      login,
      logout,
      createGroup,
      joinGroup,
      addExpense,
      payExpense,
      calculateBalances,
      getSettlements,
      syncCurrentGroup,
      updateCurrentGroup
    }}>
      {children}
    </AppContext.Provider>
  );
};
