import React from 'react';
import { Home, Users, Clock } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'home' | 'group' | 'history';
  onTabChange: (tab: 'home' | 'group' | 'history') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'group' as const, label: 'Gruppo', icon: Users },
    { id: 'history' as const, label: 'Storico', icon: Clock }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 min-w-[80px] ${
                isActive 
                  ? 'text-banking-blue bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-banking-blue' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-banking-blue' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
