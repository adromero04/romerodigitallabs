import React from 'react';
import { LayoutGrid, PlusCircle, Settings } from 'lucide-react';
import { AppScreen } from '../../App';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: 'catalog' as AppScreen,
      icon: LayoutGrid,
      label: 'Catalog',
    },
    {
      id: 'add-asset' as AppScreen,
      icon: PlusCircle,
      label: 'Add Asset',
    },
    {
      id: 'settings' as AppScreen,
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || 
            (currentScreen === 'asset-detail' && item.id === 'catalog');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[72px] transition-colors ${
                isActive ? 'text-cyan-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}