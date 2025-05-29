
import React from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const RecentTransactions: React.FC = () => {
  const { transactions } = useApp();
  
  const recentTransactions = transactions
    .slice(-5)
    .reverse();

  if (recentTransactions.length === 0) {
    return (
      <div className="px-4 mb-20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Attività recente
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nessuna transazione ancora</p>
          <p className="text-sm text-gray-400 mt-1">
            Le tue spese appariranno qui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📈 Attività recente
      </h3>
      
      <div className="space-y-3">
        {recentTransactions.map((transaction, index) => (
          <div 
            key={transaction.id}
            className="bg-white rounded-xl p-4 border border-gray-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {transaction.description}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status === 'completed' ? '✅ Completato' : '⏳ In attesa'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(transaction.date, { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="text-right ml-3">
                <span className={`text-lg font-bold ${
                  transaction.type === 'expense' 
                    ? 'text-banking-red' 
                    : 'text-banking-green'
                }`}>
                  {transaction.type === 'expense' ? '-' : '+'}€{transaction.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
