'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tenidas', label: 'Tenidas', icon: Calendar },
    { id: 'asistencias', label: 'Asistencias', icon: UserCheck },
    { id: 'hermanos', label: 'Queridos Hermanos', icon: Users },
    { id: 'cuadro-logial', label: 'Cuadro Logial', icon: Shield },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
            <Image
              src="/image_2025-06-26_102007168.png"
              alt="Logo Logia"
              fill
              className="object-cover"
            />
          </div>
          <div className=''>
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Caballeros <br />del Sol de<br /> Carabobo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">N° 269</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeTab === item.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tema</span>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}