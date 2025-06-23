"use client";

import React, { useState, useEffect, useMemo, lazy } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Calendar, DollarSign, University, Rocket } from 'lucide-react';

import { app } from '@/lib/firebase';
import { AppStateProvider } from '@/context/AppStateContext';
import FloatingEmojis from '@/components/FloatingEmojis';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from '@/components/Login';
import { useSound } from '@/context/SoundContext';

const CalendarTab = lazy(() => import('@/components/tabs/CalendarTab'));
const IncomeTab = lazy(() => import('@/components/tabs/IncomeTab'));
const UniversityTab = lazy(() => import('@/components/tabs/UniversityTab'));
const ProductivityTab = lazy(() => import('@/components/tabs/ProductivityTab'));

type Tab = 'calendar' | 'income' | 'university' | 'productivity';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'productivity', label: 'Productividad', icon: Rocket },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'income', label: 'Ingresos', icon: DollarSign },
  { id: 'university', label: 'Universidad', icon: University },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('productivity');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { playSound } = useSound();

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
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="light -top-1/4 -left-1/4 h-[70vw] w-[70vw] bg-primary" style={{ animationDelay: '0s', animationDuration: '25s' }}></div>
            <div className="light -bottom-1/4 -right-1/4 h-[65vw] w-[65vw] bg-ios-orange" style={{ animationDelay: '5s', animationDuration: '35s' }}></div>
            <div className="light top-1/4 right-1/3 h-[60vw] w-[60vw] bg-ios-green" style={{ animationDelay: '10s', animationDuration: '40s' }}></div>
        </div>
        <FloatingEmojis />
        <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm"></div>
        
        <nav className="fixed bottom-0 z-40 w-full border-t glassmorphism-nav md:sticky md:top-0 md:bottom-auto md:border-b md:border-t-0">
            <div className="container mx-auto flex h-16 items-center justify-center px-0 md:px-4">
                <div className="flex w-full items-center justify-around md:w-auto md:justify-center md:space-x-2 lg:space-x-4">
                {TABS.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id);
                        playSound('tabChange');
                    }}
                    className={`group flex h-full w-1/4 flex-col items-center justify-center rounded-none p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background
                                md:h-auto md:w-auto md:flex-row md:rounded-full md:px-4 md:py-1.5 md:text-sm md:font-medium md:space-x-2
                                transition-all duration-300
                                ${activeTab === tab.id
                                    ? 'text-primary md:bg-primary md:text-primary-foreground md:shadow-lg md:shadow-primary/30'
                                    : 'text-muted-foreground hover:text-primary md:hover:bg-accent md:hover:text-accent-foreground'
                                }`
                    }
                    >
                    <tab.icon className="h-5 w-5" />
                    <span className="mt-1 text-[11px] leading-tight md:mt-0 md:text-sm">{tab.label}</span>
                    </button>
                ))}
                </div>
            </div>
        </nav>

        <div className="relative z-20 container mx-auto p-4 pb-20 sm:p-6 lg:p-8 md:pb-6">
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
