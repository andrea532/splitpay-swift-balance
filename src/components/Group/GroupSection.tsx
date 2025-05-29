import React, { useState, useEffect } from 'react';
import { Users, Plus, Share2, Copy, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/FirebaseAppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const GroupSection: React.FC = () => {
  const { currentGroup, createGroup, joinGroup, calculateBalances, getSettlements, currentUser } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      setIsCreating(true);
      try {
        await createGroup(groupName.trim());
        setGroupName('');
        setIsCreateOpen(false);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim()) {
      setIsJoining(true);
      try {
        const success = await joinGroup(groupCode.trim().toUpperCase());
        if (success) {
          setGroupCode('');
          setIsJoinOpen(false);
        }
      } finally {
        setIsJoining(false);
      }
    }
  };

  const copyGroupCode = () => {
    if (currentGroup) {
      navigator.clipboard.writeText(currentGroup.code);
      toast({
        title: "Codice copiato! 📋",
        description: `${currentGroup.code} copiato negli appunti`,
      });
    }
  };

  const shareGroup = () => {
    if (currentGroup && navigator.share) {
      navigator.share({
        title: 'Unisciti al mio gruppo SplitPay',
        text: `Unisciti al gruppo "${currentGroup.name}" su SplitPay con il codice: ${currentGroup.code}`,
      }).catch(() => {
        // Fallback to copy
        copyGroupCode();
      });
    } else {
      copyGroupCode();
    }
  };

  if (!currentGroup) {
    return (
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 text-center">
          <Users className="w-12 h-12 text-banking-blue mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unisciti a un gruppo
          </h3>
          <p className="text-gray-600 mb-6">
            Crea un nuovo gruppo o unisciti a uno esistente per iniziare a dividere le spese
          </p>

          <div className="space-y-3">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="w-full button-banking">
                  <Plus className="w-5 h-5 mr-2" />
                  Crea nuovo gruppo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Crea nuovo gruppo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <Input
                    placeholder="Nome del gruppo (es. Cena Milano)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="h-12"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full button-banking"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      'Crea gruppo'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12 border-2 border-banking-blue text-banking-blue hover:bg-banking-blue hover:text-white">
                  <Share2 className="w-5 h-5 mr-2" />
                  Unisciti con codice
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Unisciti a un gruppo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <Input
                    placeholder="Codice gruppo (es. ABC123)"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    className="h-12 text-center text-lg font-mono"
                    maxLength={6}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full button-banking"
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Unendosi...
                      </>
                    ) : (
                      'Unisciti al gruppo'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  const balances = calculateBalances();
  const settlements = getSettlements();

  return (
    <div className="px-4 mb-6 space-y-4">
      {/* Group Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {currentGroup.name}
            </h3>
            <p className="text-gray-500">
              {currentGroup.members.length} membri
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={shareGroup}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
              <span>Condividi</span>
            </Button>
            
            <Button
              onClick={copyGroupCode}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span className="font-mono">{currentGroup.code}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentGroup.members.slice(0, 4).map((member, index) => (
            <div 
              key={member.id}
              className="flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-banking-blue text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-600 mt-1 font-medium">
                {member.name.split(' ')[0]}
              </span>
            </div>
          ))}
          
          {currentGroup.members.length > 4 && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg">
                +{currentGroup.members.length - 4}
              </div>
              <span className="text-xs text-gray-600 mt-1">altri</span>
            </div>
          )}
        </div>
      </div>

      {/* Members Balances */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Saldi dei membri</h4>
        <div className="space-y-3">
          {currentGroup.members.map(member => {
            const balance = balances[member.id] || 0;
            const isCurrentUser = currentUser?.id === member.id;
            
            return (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-banking-blue text-white rounded-full flex items-center justify-center font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name} {isCurrentUser && '(Tu)'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {balance > 0.01 ? 'Deve ricevere' : balance < -0.01 ? 'Deve dare' : 'In pari'}
                    </p>
                  </div>
                </div>
                
                <span className={`text-lg font-bold ${
                  balance > 0.01 ? 'text-banking-green' : 
                  balance < -0.01 ? 'text-banking-red' : 
                  'text-gray-500'
                }`}>
                  €{Math.abs(balance).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Come saldare i conti</h4>
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {settlement.from.avatar ? (
                      <img 
                        src={settlement.from.avatar} 
                        alt={settlement.from.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {settlement.from.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  
                  <div className="flex items-center">
                    {settlement.to.avatar ? (
                      <img 
                        src={settlement.to.avatar} 
                        alt={settlement.to.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-banking-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {settlement.to.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {settlement.from.name} → {settlement.to.name}
                    </p>
                  </div>
                </div>
                
                <span className="text-lg font-bold text-banking-blue">
                  €{settlement.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            💡 Questi pagamenti saldano tutti i debiti del gruppo
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupSection;
