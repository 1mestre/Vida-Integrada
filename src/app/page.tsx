
"use client";

import React, { useState, useEffect, useMemo, lazy } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Calendar, University, Rocket, Briefcase } from 'lucide-react';

import { app } from '@/lib/firebase';
import { AppStateProvider } from '@/context/AppStateContext';
import FloatingEmojis from '@/components/FloatingEmojis';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from '@/components/Login';
import { useSound } from '@/context/SoundContext';

const CalendarTab = lazy(() => import('@/components/tabs/CalendarTab'));
const UniversityTab = lazy(() => import('@/components/tabs/UniversityTab'));
const ProductivityTab = lazy(() => import('@/components/tabs/ProductivityTab'));
const WorkTab = lazy(() => import('@/components/tabs/WorkTab'));

type Tab = 'calendar' | 'university' | 'productivity' | 'work';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'productivity', label: 'Productividad', icon: Rocket },
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
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
      case 'university':
        return <UniversityTab />;
      case 'productivity':
        return <ProductivityTab />;
      case 'work':
        return <WorkTab />;
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
            <div className="light -top-1/4 -left-1/4 h-[70vw] w-[70vw] bg-custom-pink-1" style={{ animationDelay: '0s', animationDuration: '25s' }}></div>
            <div className="light -bottom-1/4 -right-1/4 h-[65vw] w-[65vw] bg-custom-pink-2" style={{ animationDelay: '5s', animationDuration: '35s' }}></div>
            <div className="light top-1/4 right-1/3 h-[60vw] w-[60vw] bg-custom-pink-1" style={{ animationDelay: '10s', animationDuration: '40s' }}></div>
        </div>
        <FloatingEmojis />
        <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm"></div>
        
        {/* Desktop Navigation: Sticky Top Bar */}
        <nav className="hidden md:sticky md:top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg md:block">
          <div className="container mx-auto flex h-16 items-center justify-center px-4">
            <div className="flex items-center justify-center space-x-2 lg:space-x-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    playSound('tabChange');
                  }}
                  className={`group flex flex-row items-center justify-center space-x-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Navigation: Fixed Bottom Bar */}
        <nav className="fixed bottom-0 z-40 w-full border-t border-border/50 bg-background/80 backdrop-blur-lg md:hidden">
          <div className="flex h-16 w-full items-center justify-around">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  playSound('tabChange');
                }}
                className={`group flex h-full w-1/4 flex-col items-center justify-center p-1 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="mt-1 text-[11px] leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="relative z-20 container mx-auto p-4 pb-24 sm:p-6 lg:p-8 md:pb-6">
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
