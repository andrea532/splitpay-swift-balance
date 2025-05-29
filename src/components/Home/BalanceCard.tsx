import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/FirebaseAppContext';

const BalanceCard: React.FC = () => {
  const { currentUser, currentGroup, calculateBalances, getSettlements } = useApp();
  
  if (!currentUser) return null;

  const balances = calculateBalances();
  const userBalance = balances[currentUser.id] || 0;
  const settlements = getSettlements();
  const userDebts = settlements.filter(s => s.from.id === currentUser.id);
  const userCredits = settlements.filter(s => s.to.id === currentUser.id);
  
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
    <div className="px-4 mb-6">
      <div className="banking-card rounded-2xl p-6 text-white animate-scale-in">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-300 mb-1">Il tuo saldo</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold">
                €{Math.abs(userBalance).toFixed(2)}
              </span>
              <BalanceIcon className="w-6 h-6" />
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

        <div className="flex justify-between items-center mb-4">
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

        {/* Debts and Credits Summary */}
        <div className="border-t border-white/20 pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-300 mb-1">Devi pagare</p>
            <p className="text-lg font-semibold">
              €{userDebts.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
            </p>
            {userDebts.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                a {userDebts.length} {userDebts.length === 1 ? 'persona' : 'persone'}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-300 mb-1">Devi ricevere</p>
            <p className="text-lg font-semibold">
              €{userCredits.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
            </p>
            {userCredits.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                da {userCredits.length} {userCredits.length === 1 ? 'persona' : 'persone'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* No Group Warning */}
      {!currentGroup && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Nessun gruppo attivo
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Crea o unisciti a un gruppo per iniziare a dividere le spese
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {currentGroup && userDebts.length > 0 && (
        <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            💸 Pagamenti in sospeso
          </p>
          {userDebts.slice(0, 2).map((debt, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">
                Devi €{debt.amount.toFixed(2)} a {debt.to.name}
              </span>
              <span className="text-xs text-banking-blue font-medium">
                Paga →
              </span>
            </div>
          ))}
          {userDebts.length > 2 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{userDebts.length - 2} altri pagamenti
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
