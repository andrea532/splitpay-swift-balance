import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/FirebaseAppContext';
import { Button } from '@/components/ui/button';

interface QuickExpenseButtonsProps {
  onCustomExpense: () => void;
}

const QuickExpenseButtons: React.FC<QuickExpenseButtonsProps> = ({ onCustomExpense }) => {
  const { addExpense, currentGroup } = useApp();
  const [addingAmount, setAddingAmount] = useState<number | null>(null);

  const quickAmounts = [5, 10, 20, 30, 50, 100];

  const handleQuickExpense = async (amount: number) => {
    if (!currentGroup) {
      onCustomExpense();
      return;
    }
    
    setAddingAmount(amount);
    try {
      await addExpense(amount, `Spesa veloce €${amount}`);
    } finally {
      setAddingAmount(null);
    }
  };

  return (
    <div className="px-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💨 Spesa veloce
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {quickAmounts.map((amount) => (
          <Button
            key={amount}
            onClick={() => handleQuickExpense(amount)}
            className="h-16 text-lg font-bold bg-white border-2 border-gray-200 text-gray-700 hover:border-banking-blue hover:text-banking-blue hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
            disabled={!currentGroup || addingAmount !== null}
          >
            {addingAmount === amount ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `€${amount}`
            )}
          </Button>
        ))}
      </div>

      <Button 
        onClick={onCustomExpense}
        className="w-full h-12 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 hover:border-banking-blue hover:text-banking-blue hover:bg-blue-50 rounded-xl transition-all duration-200"
        disabled={!currentGroup}
      >
        <Plus className="w-5 h-5 mr-2" />
        Importo personalizzato
      </Button>

      {!currentGroup && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Entra in un gruppo per aggiungere spese
        </p>
      )}
    </div>
  );
};

export default QuickExpenseButtons;
