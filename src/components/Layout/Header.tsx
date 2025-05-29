
import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { currentUser, logout } = useApp();

  if (!currentUser) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-banking-blue">SplitPay</h1>
          <p className="text-sm text-gray-500">Ciao, {currentUser.name}!</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
