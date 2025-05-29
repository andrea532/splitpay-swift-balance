
import React, { useState } from 'react';
import { Plus, Euro, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { addExpense, currentGroup } = useApp();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      addExpense(numAmount, description || `Spesa €${numAmount}`);
      setAmount('');
      setDescription('');
      setIsExpenseModalOpen(false);
      setIsOpen(false);
    }
  };

  const actions = [
    {
      icon: Euro,
      label: 'Nuova spesa',
      onClick: () => {
        setIsExpenseModalOpen(true);
        setIsOpen(false);
      },
      color: 'bg-banking-green'
    },
    {
      icon: Users,
      label: 'Invita amici',
      onClick: () => {
        // TODO: Implement invite friends
        setIsOpen(false);
      },
      color: 'bg-banking-blue'
    },
    {
      icon: Clock,
      label: 'Storico',
      onClick: () => {
        // TODO: Navigate to history
        setIsOpen(false);
      },
      color: 'bg-purple-500'
    }
  ];

  if (!currentGroup) return null;

  return (
    <>
      <div className="fixed bottom-20 right-6 z-40">
        {/* Action Buttons */}
        {isOpen && (
          <div className="mb-4 space-y-3 animate-fade-in">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-end animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm mr-3 opacity-90">
                    {action.label}
                  </span>
                  <Button
                    onClick={action.onClick}
                    className={`w-12 h-12 rounded-full ${action.color} hover:scale-110 transition-transform duration-200 shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main FAB */}
        <Button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full bg-banking-blue hover:bg-banking-blue-dark shadow-2xl transition-all duration-300 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Expense Modal */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Aggiungi nuova spesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
    </>
  );
};

export default FloatingActionButton;
