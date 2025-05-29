import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AppProvider } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Receipt, Users, CreditCard, CheckCircle, Clock, Filter } from 'lucide-react';

// Components
import LoginScreen from '@/components/Auth/LoginScreen';
import Header from '@/components/Layout/Header';
import TabNavigation from '@/components/Layout/TabNavigation';
import BalanceCard from '@/components/Home/BalanceCard';
import QuickExpenseButtons from '@/components/Home/QuickExpenseButtons';
import RecentTransactions from '@/components/Home/RecentTransactions';
import GroupSection from '@/components/Group/GroupSection';
import FloatingActionButton from '@/components/FloatingActionButton';

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MainApp: React.FC = () => {
  const { currentUser, currentGroup, addExpense, expenses, transactions, payExpense, getSettlements } = useApp();
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'history'>('home');
  const [isCustomExpenseOpen, setIsCustomExpenseOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expenses' | 'payments'>('all');

  const handleCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(customAmount);
    if (numAmount > 0) {
      addExpense(numAmount, customDescription || `Spesa €${numAmount}`);
      setCustomAmount('');
      setCustomDescription('');
      setIsCustomExpenseOpen(false);
    }
  };

  const handlePayment = (toUserId: string, amount: number) => {
    // In a real app, this would handle the actual payment
    // For now, we'll just create a payment transaction
    const expense: Expense = {
      id: `expense_${Date.now()}`,
      groupId: currentGroup!.id,
      amount: amount,
      description: `Pagamento diretto`,
      paidBy: currentUser!.id,
      participants: [toUserId],
      createdAt: new Date(),
      createdBy: currentUser!.id
    };
    
    payExpense(expense.id);
  };

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <BalanceCard />
            <QuickExpenseButtons onCustomExpense={() => setIsCustomExpenseOpen(true)} />
            <RecentTransactions />
          </>
        );
      case 'group':
        return (
          <>
            <GroupSection />
            
            {/* Quick Settlements */}
            {currentGroup && getSettlements().length > 0 && (
              <div className="px-4 mb-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💸 Pagamenti rapidi
                </h3>
                <div className="space-y-3">
                  {getSettlements()
                    .filter(s => s.from.id === currentUser.id)
                    .map((settlement, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Devi €{settlement.amount.toFixed(2)} a {settlement.to.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Tocca per pagare
                            </p>
                          </div>
                          <Button
                            onClick={() => handlePayment(settlement.to.id, settlement.amount)}
                            className="button-banking"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paga ora
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        );
      case 'history':
        return (
          <div className="px-4 mb-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Storico completo
              </h3>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutto</SelectItem>
                  <SelectItem value="expenses">Spese</SelectItem>
                  <SelectItem value="payments">Pagamenti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentGroup ? (
              <div className="space-y-3">
                {/* Group expenses */}
                {expenses
                  .filter(e => e.groupId === currentGroup.id && 
                    (filterType === 'all' || filterType === 'expenses'))
                  .reverse()
                  .map((expense) => {
                    const paidByUser = currentGroup.members.find(m => m.id === expense.paidBy);
                    const isCurrentUserPayer = expense.paidBy === currentUser.id;
                    
                    return (
                      <div key={expense.id} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Receipt className="w-4 h-4 text-banking-blue" />
                              <p className="font-medium text-gray-900">
                                {expense.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-600">
                                Pagato da {isCurrentUserPayer ? 'te' : paidByUser?.name || 'Sconosciuto'}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">
                                {formatDistanceToNow(new Date(expense.createdAt), { 
                                  addSuffix: true, 
                                  locale: it 
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center mt-2 space-x-2">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Diviso tra {expense.participants.length} persone
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right ml-3">
                            <span className="text-lg font-bold text-gray-900">
                              €{expense.amount.toFixed(2)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              €{(expense.amount / expense.participants.length).toFixed(2)} a testa
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Transactions */}
                {transactions
                  .filter(t => filterType === 'all' || 
                    (filterType === 'payments' && t.type === 'payment'))
                  .reverse()
                  .map((transaction) => (
                    <div key={transaction.id} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-banking-green" />
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.status === 'completed' ? '✅ Completato' : '⏳ In attesa'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(transaction.date), { 
                                addSuffix: true, 
                                locale: it 
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right ml-3">
                          <span className="text-lg font-bold text-banking-green">
                            €{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                {expenses.filter(e => e.groupId === currentGroup.id).length === 0 && 
                 transactions.length === 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nessuna transazione ancora</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Unisciti a un gruppo per vedere lo storico</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-4 pb-20">
        {renderContent()}
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <FloatingActionButton />

      {/* Custom Expense Modal */}
      <Dialog open={isCustomExpenseOpen} onOpenChange={setIsCustomExpenseOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Importo personalizzato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-12 text-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione (opzionale)
              </label>
              <Textarea
                placeholder="Di cosa si tratta?"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full button-banking h-12">
              Aggiungi spesa
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default Index;