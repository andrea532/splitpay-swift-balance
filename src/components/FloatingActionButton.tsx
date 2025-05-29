import React, { useState } from 'react';
import { Plus, Euro, Users, Clock, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

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

  const handleInviteFriends = () => {
    if (currentGroup) {
      if (navigator.share) {
        navigator.share({
          title: 'Unisciti al mio gruppo SplitPay',
          text: `Unisciti al gruppo "${currentGroup.name}" su SplitPay! Usa il codice: ${currentGroup.code}`,
        }).then(() => {
          toast({
            title: "Invito condiviso! 🎉",
            description: "I tuoi amici possono ora unirsi al gruppo",
          });
        }).catch(() => {
          // User cancelled or error
          copyGroupCode();
        });
      } else {
        copyGroupCode();
      }
    }
    setIsOpen(false);
  };

  const copyGroupCode = () => {
    if (currentGroup) {
      navigator.clipboard.writeText(currentGroup.code);
      toast({
        title: "Codice copiato! 📋",
        description: `Condividi il codice ${currentGroup.code} con i tuoi amici`,
      });
    }
  };

  const actions = [
    {
      icon: Euro,
      label: 'Nuova spesa',
      onClick: () => {
        if (!currentGroup) {
          toast({
            title: "Nessun gruppo",
            description: "Prima crea o unisciti a un gruppo",
            variant: "destructive"
          });
          setIsOpen(false);
          return;
        }
        setIsExpenseModalOpen(true);
        setIsOpen(false);
      },
      color: 'bg-banking-green hover:bg-banking-green-dark'
    },
    {
      icon: Share2,
      label: 'Invita amici',
      onClick: handleInviteFriends,
      color: 'bg-banking-blue hover:bg-banking-blue-dark',
      disabled: !currentGroup
    },
    {
      icon: Clock,
      label: 'Storico',
      onClick: () => {
        // Scroll to history tab
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) {
          (historyTab as HTMLElement).click();
        }
        setIsOpen(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <>
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

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
                  <span className="bg-black/90 text-white px-3 py-1 rounded-lg text-sm mr-3">
                    {action.label}
                  </span>
                  <Button
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`w-12 h-12 rounded-full ${action.color} transition-all duration-200 shadow-lg ${
                      action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
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
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Expense Modal */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi nuova spesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  €
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg pl-8"
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <Textarea
                placeholder="Es. Cena al ristorante, Benzina, Spesa supermercato..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setAmount('');
                  setDescription('');
                  setIsExpenseModalOpen(false);
                }}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                className="flex-1 button-banking"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Aggiungi spesa
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
