'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoginForm } from '@/components/auth/login-form';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { TenidasPanel } from '@/components/dashboard/tenidas-panel';
import { AsistenciasPanel } from '@/components/dashboard/asistencias-panel';
import { HermanosPanel } from '@/components/dashboard/hermanos-panel';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // The auth state change will be handled by the listener
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'tenidas':
        return <TenidasPanel />;
      case 'asistencias':
        return <AsistenciasPanel />;
      case 'hermanos':
        return <HermanosPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 pt-16 lg:pt-6">
          {renderActivePanel()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}