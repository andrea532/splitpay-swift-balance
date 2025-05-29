import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Expense, Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  currentGroup: Group | null;
  expenses: Expense[];
  transactions: Transaction[];
  groups: { [code: string]: Group };
  login: (name: string) => void;
  logout: () => void;
  createGroup: (name: string) => Promise<string>;
  joinGroup: (code: string) => Promise<boolean>;
  addExpense: (amount: number, description: string) => Promise<void>;
  payExpense: (expenseId: string) => Promise<void>;
  calculateBalances: () => { [userId: string]: number };
  getSettlements: () => { from: User; to: User; amount: number }[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const FirebaseAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<{ [code: string]: Group }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('splitpay_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Subscribe to current group changes
  useEffect(() => {
    if (!currentGroup) return;

    // Unsubscribe from previous listeners
    unsubscribers.forEach(unsub => unsub());

    const groupRef = doc(db, 'groups', currentGroup.code);
    const unsubGroup = onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        const groupData = doc.data() as Group;
        setCurrentGroup(groupData);
        localStorage.setItem('splitpay_group', JSON.stringify(groupData));
        
        // Check for new members
        if (groupData.members.length > currentGroup.members.length) {
          const newMembers = groupData.members.slice(currentGroup.members.length);
          toast({
            title: "Nuovo membro! 🎉",
            description: `${newMembers.map(m => m.name).join(', ')} si ${newMembers.length === 1 ? 'è unito' : 'sono uniti'} al gruppo`,
          });
        }
      }
    });

    // Subscribe to expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('groupId', '==', currentGroup.id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData: Expense[] = [];
      snapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(expensesData);
    });

    // Subscribe to transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('groupId', '==', currentGroup.id),
      orderBy('date', 'desc')
    );
    
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(transactionsData);
    });

    setUnsubscribers([unsubGroup, unsubExpenses, unsubTransactions]);

    return () => {
      unsubGroup();
      unsubExpenses();
      unsubTransactions();
    };
  }, [currentGroup?.code]);

  const login = (name: string) => {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      balance: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    setCurrentUser(user);
    localStorage.setItem('splitpay_user', JSON.stringify(user));
    
    // Check if there's a saved group
    const savedGroup = localStorage.getItem('splitpay_group');
    if (savedGroup) {
      const group = JSON.parse(savedGroup);
      joinGroup(group.code);
    }
    
    toast({
      title: `Benvenuto, ${name}! 👋`,
      description: "Il tuo account è pronto per dividere le spese",
    });
  };

  const logout = () => {
    unsubscribers.forEach(unsub => unsub());
    setCurrentUser(null);
    setCurrentGroup(null);
    setExpenses([]);
    setTransactions([]);
    localStorage.removeItem('splitpay_user');
    localStorage.removeItem('splitpay_group');
    
    toast({
      title: "Logout effettuato",
      description: "A presto! 👋",
    });
  };

  const createGroup = async (name: string): Promise<string> => {
    if (!currentUser) throw new Error('User not logged in');
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group: Group = {
      id: `group_${Date.now()}`,
      name,
      code,
      members: [currentUser],
      createdAt: new Date()
    };
    
    try {
      // Save to Firestore
      await setDoc(doc(db, 'groups', code), group);
      
      setCurrentGroup(group);
      localStorage.setItem('splitpay_group', JSON.stringify(group));
      
      toast({
        title: `Gruppo "${name}" creato! 🎉`,
        description: `Codice gruppo: ${code}`,
      });
      
      return code;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare il gruppo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const joinGroup = async (code: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    if (code.length !== 6) {
      toast({
        title: "Codice non valido",
        description: "Il codice deve essere di 6 caratteri",
        variant: "destructive"
      });
      return false;
    }

    const upperCode = code.toUpperCase();
    
    try {
      const groupRef = doc(db, 'groups', upperCode);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data() as Group;
        
        // Check if user is already a member
        const isAlreadyMember = groupData.members.some(
          m => m.id === currentUser.id || m.name === currentUser.name
        );
        
        if (!isAlreadyMember) {
          // Add user to group
          await updateDoc(groupRef, {
            members: arrayUnion(currentUser)
          });
          
          toast({
            title: `Entrato nel gruppo "${groupData.name}"! ✅`,
            description: `Benvenuto nel gruppo!`,
          });
        } else {
          setCurrentGroup(groupData);
          localStorage.setItem('splitpay_group', JSON.stringify(groupData));
          
          toast({
            title: `Bentornato nel gruppo "${groupData.name}"!`,
            description: `${groupData.members.length} membri nel gruppo`,
          });
        }
        
        return true;
      } else {
        toast({
          title: "Gruppo non trovato",
          description: "Controlla il codice e riprova",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile unirsi al gruppo",
        variant: "destructive"
      });
      return false;
    }
  };

  const addExpense = async (amount: number, description: string) => {
    if (!currentUser || !currentGroup) {
      toast({
        title: "Errore",
        description: "Devi essere in un gruppo per aggiungere spese",
        variant: "destructive"
      });
      return;
    }

    try {
      const expense = {
        groupId: currentGroup.id,
        amount,
        description,
        paidBy: currentUser.id,
        paidByName: currentUser.name,
        participants: currentGroup.members.map(m => m.id),
        createdAt: serverTimestamp(),
        createdBy: currentUser.id,
        createdByName: currentUser.name
      };

      await addDoc(collection(db, 'expenses'), expense);

      const transaction = {
        groupId: currentGroup.id,
        type: 'expense',
        amount,
        description: `${currentUser.name} ha pagato: ${description}`,
        date: serverTimestamp(),
        from: currentUser.id,
        fromName: currentUser.name,
        status: 'completed'
      };

      await addDoc(collection(db, 'transactions'), transaction);

      toast({
        title: `Spesa aggiunta: €${amount.toFixed(2)}`,
        description: description || "Spesa generica",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la spesa",
        variant: "destructive"
      });
    }
  };

  const payExpense = async (expenseId: string) => {
    if (!currentUser || !currentGroup) return;

    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    try {
      const transaction = {
        groupId: currentGroup.id,
        type: 'payment',
        amount: expense.amount / expense.participants.length,
        description: `Pagamento quota per: ${expense.description}`,
        date: serverTimestamp(),
        from: currentUser.id,
        fromName: currentUser.name,
        to: expense.paidBy,
        toName: expense.paidByName || 'Unknown',
        status: 'completed'
      };

      await addDoc(collection(db, 'transactions'), transaction);

      toast({
        title: "Pagamento registrato! 💳",
        description: `€${transaction.amount.toFixed(2)} pagato`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile registrare il pagamento",
        variant: "destructive"
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
    
    const debtors: { user: User; amount: number }[] = [];
    const creditors: { user: User; amount: number }[] = [];
    
    currentGroup.members.forEach(member => {
      const balance = balances[member.id] || 0;
      if (balance < -0.01) {
        debtors.push({ user: member, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        creditors.push({ user: member, amount: balance });
      }
    });
    
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
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
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};
