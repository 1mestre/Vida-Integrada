
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

export interface KanbanTask {
  id: string;
  content: string;
  column: 'todo' | 'inprogress' | 'done';
  workItemId?: string;
  color?: string;
}

export interface WorkItem {
  id: string;
  clientName: string;
  orderNumber: string;
  deliveryDate: string;
  genre: string;
  packageType: 'Masterpiece' | 'Exclusive' | 'Amateurs';
  remakeType: 'Original' | 'Single Remake' | 'Multiple Remakes' | 'Original Multiple Beats';
  key: string;
  bpm: string;
  deliveryStatus: 'Pending' | 'In Transit' | 'In Revision' | 'Delivered' | 'Returned';
  revisionsRemaining: number;
}

interface AppState {
  contributions: Contribution[];
  monthlyTargets: Record<string, number>;
  selectedInputCurrencyIngresos: 'USD' | 'COP';
  timetableData: TimetableEvent[];
  calendarEventsData: CalendarEvent[];
  workItems: WorkItem[];
  tasks: KanbanTask[];
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
  workItems: [],
  tasks: [],
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
          if (!data.selectedInputcurrencyIngresos) {
            data.selectedInputcurrencyIngresos = 'USD';
          }
          if (!data.workItems) {
            data.workItems = [];
          }
          if (!data.tasks) {
            data.tasks = [];
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

  const handleSetAppState = (newState: Partial<AppState>) => {
    setAppState(prevState => {
      const updatedState = { ...prevState, ...newState };

      if (db) {
        const docRef = doc(db, 'organizador-publico', 'datos-compartidos');
        setDoc(docRef, { 
          ...updatedState,
          lastUpdated: serverTimestamp()
        }).catch(err => {
          console.error("Firebase setDoc error:", err);
          setError("No se pudieron guardar los cambios.");
          toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: "Tus últimos cambios no se pudieron guardar. Por favor, inténtalo de nuevo.",
          });
          setAppState(prevState);
        });
      } else {
         console.warn("Firebase no está configurado, los cambios no se guardarán.");
      }
      return updatedState;
    });
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
