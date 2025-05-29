
import React, { useState } from 'react';
import { Users, Plus, Share2, Copy } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const GroupSection: React.FC = () => {
  const { currentGroup, createGroup, joinGroup } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      createGroup(groupName.trim());
      setGroupName('');
      setIsCreateOpen(false);
    }
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim()) {
      const success = joinGroup(groupCode.trim().toUpperCase());
      if (success) {
        setGroupCode('');
        setIsJoinOpen(false);
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
                  <Button type="submit" className="w-full button-banking">
                    Crea gruppo
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
                  <Button type="submit" className="w-full button-banking">
                    Unisciti al gruppo
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
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

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Condividi il codice <span className="font-mono font-bold">{currentGroup.code}</span> per invitare altri membri
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupSection;
