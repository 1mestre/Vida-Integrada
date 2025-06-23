"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, doc, onSnapshot, setDoc, serverTimestamp } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface Contribution {
  id: string;
  date: string;
  netUSD: number;
  rate: number;
  netCOP: number;
}

interface TimetableEvent {
  id: string;
  title: string;
  teacher?: string;
  day: string;
  startTime: string;
  endTime:string;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  allDay: boolean;
  color: string;
}

interface AppState {
  contributions: Contribution[];
  monthlyTargets: Record<string, number>;
  selectedInputCurrencyIngresos: 'USD' | 'COP';
  timetableData: TimetableEvent[];
  calendarEventsData: CalendarEvent[];
  secretKey?: string;
}

interface AppStateContextType {
  appState: AppState;
  setAppState: (newState: Partial<AppState>) => void;
  loading: boolean;
  error: string | null;
}

const initialAppState: AppState = {
  contributions: [],
  monthlyTargets: {},
  selectedInputCurrencyIngresos: 'USD',
  timetableData: [],
  calendarEventsData: [],
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      setError("Configuración de Firebase incompleta. La sincronización de datos está desactivada.");
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'organizador-publico', 'datos-compartidos');
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppState;
          if (!data.selectedInputCurrencyIngresos) {
            data.selectedInputCurrencyIngresos = 'USD';
          }
          setAppState(data);
        } else {
          // Document doesn't exist, create it with initial state
          setDoc(docRef, { ...initialAppState, lastUpdated: serverTimestamp() });
        }
        setLoading(false);
      }, 
      (err) => {
        console.error("Firebase snapshot error:", err);
        setError("No se pudo conectar con la base de datos.");
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudieron cargar los datos. Revisa tu conexión a internet.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetAppState = async (newState: Partial<AppState>) => {
    const updatedState = { ...appState, ...newState };
    setAppState(updatedState); // Optimistic update
    
    if (!db) {
      console.warn("Firebase no está configurado, los cambios no se guardarán.");
      return;
    }

    try {
      const docRef = doc(db, 'organizador-publico', 'datos-compartidos');
      await setDoc(docRef, { 
        ...updatedState,
        secretKey: "DEVdrf49"
      });
    } catch (err) {
      console.error("Firebase setDoc error:", err);
      setError("No se pudieron guardar los cambios.");
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "Tus últimos cambios no se pudieron guardar. Por favor, inténtalo de nuevo.",
      });
      // Optionally, revert to previous state here
    }
  };

  return (
    <AppStateContext.Provider value={{ appState, setAppState: handleSetAppState, loading, error }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
