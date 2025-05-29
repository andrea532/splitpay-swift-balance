
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AppProvider } from '@/contexts/AppContext';

// Components
import LoginScreen from '@/components/Auth/LoginScreen';
import Header from '@/components/Layout/Header';
import TabNavigation from '@/components/Layout/TabNavigation';
import BalanceCard from '@/components/Home/BalanceCard';
import QuickExpenseButtons from '@/components/Home/QuickExpenseButtons';
import RecentTransactions from '@/components/Home/RecentTransactions';
import GroupSection from '@/components/Group/GroupSection';
import FloatingActionButton from '@/components/FloatingActionButton';

// Modals
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const MainApp: React.FC = () => {
  const { currentUser, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'history'>('home');
  const [isCustomExpenseOpen, setIsCustomExpenseOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customDescription, setCustomDescription] = useState('');

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
            <div className="px-4 mb-20">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500">Gestione gruppo in sviluppo</p>
                <p className="text-sm text-gray-400 mt-1">
                  Presto potrai gestire spese e membri
                </p>
              </div>
            </div>
          </>
        );
      case 'history':
        return (
          <div className="px-4 mb-20">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500">Storico completo in sviluppo</p>
              <p className="text-sm text-gray-400 mt-1">
                Visualizza tutte le tue transazioni passate
              </p>
            </div>
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
