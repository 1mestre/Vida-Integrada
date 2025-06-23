
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Calendar, DollarSign, University, Rocket } from 'lucide-react';

import { app } from '@/lib/firebase';
import { AppStateProvider } from '@/context/AppStateContext';
import FloatingEmojis from '@/components/FloatingEmojis';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from '@/components/Login';
import { playSound } from '@/lib/audio';

// Lazy load tab components for better initial performance
const CalendarTab = React.lazy(() => import('@/components/tabs/CalendarTab'));
const IncomeTab = React.lazy(() => import('@/components/tabs/IncomeTab'));
const UniversityTab = React.lazy(() => import('@/components/tabs/UniversityTab'));
const ProductivityTab = React.lazy(() => import('@/components/tabs/ProductivityTab'));

type Tab = 'calendar' | 'income' | 'university' | 'productivity';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'income', label: 'Ingresos', icon: DollarSign },
  { id: 'university', label: 'Universidad', icon: University },
  { id: 'productivity', label: 'Productividad', icon: Rocket },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!app) {
        setAuthLoading(false);
        return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarTab />;
      case 'income':
        return <IncomeTab />;
      case 'university':
        return <UniversityTab />;
      case 'productivity':
        return <ProductivityTab />;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <h1 className="text-3xl font-bold text-foreground animate-pulse">
          Verificando autenticación...
        </h1>
        <div className="mt-8 text-4xl animate-bounce">🚀</div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }

  return (
    <AppStateProvider>
      <main className="relative min-h-screen w-full overflow-hidden">
        <FloatingEmojis />
        
        <header className="sticky top-0 z-40 w-full glassmorphism-nav">
          <div className="container mx-auto flex h-16 items-center justify-center px-4">
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {TABS.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => {
                    setActiveTab(tab.id);
                    playSound('https://actions.google.com/sounds/v1/ui/ui_tap_forward.ogg', 0.3);
                  }}
                  className={`transition-all duration-300 rounded-full px-3 py-1.5 h-auto text-xs sm:text-sm sm:px-4 ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'text-muted-foreground'}`}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </nav>
          </div>
        </header>

        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
           <React.Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </React.Suspense>
        </div>
      </main>
    </AppStateProvider>
  );
}
