import React, { useState } from 'react';
import { Users, Plus, Share2, Copy, Trash2, Euro } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const GroupSection: React.FC = () => {
  const { 
    currentGroup, 
    currentUser,
    createGroup, 
    joinGroup, 
    addMemberToGroup,
    removeMemberFromGroup,
    calculateBalances,
    getGroupExpenses,
    addExpense,
    settleDebt
  } = useApp();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [memberName, setMemberName] = useState('');
  
  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  // Settle debt state
  const [settleToUserId, setSettleToUserId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberName.trim()) {
      addMemberToGroup(memberName.trim());
      setMemberName('');
      setIsAddMemberOpen(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (amount > 0 && expensePaidBy && selectedParticipants.length > 0) {
      addExpense(amount, expenseDescription || `Spesa €${amount}`, expensePaidBy, selectedParticipants);
      setExpenseAmount('');
      setExpenseDescription('');
      setExpensePaidBy('');
      setSelectedParticipants([]);
      setIsAddExpenseOpen(false);
    }
  };

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);
    if (amount > 0 && settleToUserId && currentUser) {
      settleDebt(currentUser.id, settleToUserId, amount);
      setSettleAmount('');
      setSettleToUserId('');
      setIsSettleOpen(false);
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

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const balances = calculateBalances();
  const groupExpenses = getGroupExpenses();

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

        {/* Members List */}
        <div className="space-y-3 mb-4">
          {currentGroup.members.map((member) => {
            const balance = balances[member.id] || 0;
            const isCurrentUser = member.id === currentUser?.id;
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow"
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
                    <p className={`text-sm font-medium ${
                      balance > 0 ? 'text-banking-green' : 
                      balance < 0 ? 'text-banking-red' : 
                      'text-gray-500'
                    }`}>
                      {balance > 0 ? '+' : ''}€{balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {!isCurrentUser && currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMemberFromGroup(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10">
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi membro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Aggiungi nuovo membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <Input
                  placeholder="Nome del membro"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="h-12"
                  required
                />
                <Button type="submit" className="w-full button-banking">
                  Aggiungi al gruppo
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="button-banking h-10">
                <Euro className="w-4 h-4 mr-2" />
                Nuova spesa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Aggiungi spesa di gruppo</DialogTitle>
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
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <Textarea
                    placeholder="Di cosa si tratta?"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pagato da
                  </label>
                  <Select value={expensePaidBy} onValueChange={setExpensePaidBy} required>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleziona chi ha pagato" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentGroup.members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dividi tra
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentGroup.members.map(member => (
                      <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={selectedParticipants.includes(member.id)}
                          onCheckedChange={() => toggleParticipant(member.id)}
                        />
                        <span className="text-sm">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full button-banking h-12"
                  disabled={selectedParticipants.length === 0}
                >
                  Aggiungi spesa
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recent Expenses */}
      {groupExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Spese del gruppo
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {groupExpenses.slice(-5).reverse().map(expense => {
              const payer = currentGroup.members.find(m => m.id === expense.paidBy);
              const sharePerPerson = expense.amount / expense.participants.length;
              
              return (
                <div key={expense.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-600">
                        Pagato da {payer?.name} • €{sharePerPerson.toFixed(2)} a testa
                      </p>
                    </div>
                    <p className="font-bold text-lg">€{expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settle Debts */}
      {currentUser && balances[currentUser.id] < 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Salda i tuoi debiti
          </h4>
          <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
            <DialogTrigger asChild>
              <Button className="w-full button-banking">
                Salda debito
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Salda debito</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSettle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paga a
                  </label>
                  <Select value={settleToUserId} onValueChange={setSettleToUserId} required>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleziona destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentGroup.members
                        .filter(m => m.id !== currentUser.id && balances[m.id] > 0)
                        .map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} (+€{balances[member.id].toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importo
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <Button type="submit" className="w-full button-banking h-12">
                  Conferma pagamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default GroupSection;