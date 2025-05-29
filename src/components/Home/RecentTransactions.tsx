import React from 'react';
import { Clock, CreditCard, Users, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const RecentTransactions: React.FC = () => {
  const { transactions, expenses, currentGroup, currentUser } = useApp();
  
  const groupExpenses = expenses.filter(e => e.groupId === currentGroup?.id);
  const groupTransactions = transactions.slice(-10).reverse();

  if (groupTransactions.length === 0 && groupExpenses.length === 0) {
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
        {/* Show recent expenses */}
        {groupExpenses.slice(-5).reverse().map((expense, index) => {
          const paidByUser = currentGroup?.members.find(m => m.id === expense.paidBy);
          const isCurrentUserPayer = expense.paidBy === currentUser?.id;
          
          return (
            <div 
              key={expense.id}
              className="bg-white rounded-xl p-4 border border-gray-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <CreditCard className={`w-4 h-4 ${isCurrentUserPayer ? 'text-banking-green' : 'text-banking-blue'}`} />
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
                      Diviso tra {expense.participants.length} {expense.participants.length === 1 ? 'persona' : 'persone'}
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

        {/* Show recent transactions */}
        {groupTransactions.map((transaction, index) => {
          const Icon = transaction.type === 'expense' ? ArrowUpRight : 
                       transaction.type === 'payment' ? CheckCircle : ArrowDownRight;
          const iconColor = transaction.type === 'expense' ? 'text-banking-red' : 'text-banking-green';
          
          return (
            <div 
              key={transaction.id}
              className="bg-white rounded-xl p-4 border border-gray-200 animate-fade-in"
              style={{ animationDelay: `${(index + groupExpenses.length) * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
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
                  <span className={`text-lg font-bold ${iconColor}`}>
                    {transaction.type === 'expense' ? '-' : '+'}€{transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;
