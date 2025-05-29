
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const BalanceCard: React.FC = () => {
  const { currentUser, calculateBalances } = useApp();
  
  if (!currentUser) return null;

  const balances = calculateBalances();
  const userBalance = balances[currentUser.id] || 0;
  
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-banking-green';
    if (balance < 0) return 'text-banking-red';
    return 'text-gray-500';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return TrendingUp;
    if (balance < 0) return TrendingDown;
    return Minus;
  };

  const BalanceIcon = getBalanceIcon(userBalance);

  return (
    <div className="banking-card rounded-2xl p-6 text-white mx-4 mb-6 animate-scale-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-300 mb-1">Il tuo saldo</p>
          <div className="flex items-center space-x-2">
            <span className={`text-3xl font-bold ${getBalanceColor(userBalance)}`}>
              €{Math.abs(userBalance).toFixed(2)}
            </span>
            <BalanceIcon className={`w-6 h-6 ${getBalanceColor(userBalance)}`} />
          </div>
        </div>
        
        <div className="text-right">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-lg"
              />
            ) : (
              <span className="text-lg font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-300">
            {userBalance > 0 && "Ti devono restituire"}
            {userBalance < 0 && "Devi restituire"}
            {userBalance === 0 && "Sei in pari"}
          </p>
          <p className="text-sm font-medium text-gray-200">
            {currentUser.name}
          </p>
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            userBalance >= 0 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {userBalance >= 0 ? '✅ Credito' : '⚠️ Debito'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
