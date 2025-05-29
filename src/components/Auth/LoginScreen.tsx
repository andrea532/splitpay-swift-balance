
import React, { useState } from 'react';
import { CreditCard, Users, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { login } = useApp();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Ultra Veloce',
      description: 'Inserisci spese in 2 tap con i bottoni rapidi'
    },
    {
      icon: Users,
      title: 'Multi Gruppo',
      description: 'Gestisci più eventi contemporaneamente'
    },
    {
      icon: TrendingUp,
      title: 'Saldi Real-time',
      description: 'Vedi subito chi deve cosa a chi'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-blue to-banking-blue-dark flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 text-center text-white">
        <div className="mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">SplitPay</h1>
          <p className="text-xl text-blue-100">
            Dividi le spese come un pro
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8 w-full max-w-sm">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-blue-100 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-t-3xl p-6 animate-fade-in">
        <form onSubmit={handleLogin} className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Accedi al tuo account
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Inserisci il tuo nome per iniziare
          </p>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Il tuo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg border-2 border-gray-200 focus:border-banking-blue rounded-xl"
              required
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg button-banking"
              disabled={!name.trim()}
            >
              Entra in SplitPay
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Il tuo account verrà creato automaticamente
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
