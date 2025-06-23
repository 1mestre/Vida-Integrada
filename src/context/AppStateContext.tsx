
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, doc, onSnapshot, setDoc, serverTimestamp } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface Contribution {
  id: string;
  date: string;
  netUSD: number;
  rate: number;
  netCOP: number;
}

export interface TimetableEvent {
  id: string;
  title: string;
  teacher?: string;
  day: string;
  startTime: string;
  endTime:string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  allDay: boolean;
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  workItemId?: string;
  universityTaskId?: string;
}

export interface KanbanTask {
  id: string;
  content: string;
  column: 'todo' | 'inprogress' | 'done';
  workItemId?: string;
  universityTaskId?: string;
  color?: string;
}

export interface WorkPackageTemplate {
  id: string;
  name: string;
  price: number;
  revisions: number;
  songLength: number; // in seconds
  numberOfInstruments: number;
  separateFiles: boolean;
  masterAudio: boolean;
  projectFileDelivery: boolean;
  exclusiveLicense: boolean;
  vocalProduction: boolean;
}

export interface WorkItem {
  id: string;
  clientName: string;
  orderNumber: string;
  deliveryDate: string;
  genre: string;
  bpm: string;
  key: string;
  deliveryStatus: 'Pending' | 'In Transit' | 'In Revision' | 'Delivered' | 'Returned';
  
  // Snapshot fields from template
  packageName: string;
  price: number;
  revisionsRemaining: number;
  songLength: number;
  numberOfInstruments: number;
  separateFiles: boolean;
  masterAudio: boolean;
  projectFileDelivery: boolean;
  exclusiveLicense: boolean;
  vocalProduction: boolean;
}

export interface UniversityTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // Formato 'yyyy-MM-dd'
  status: 'pendiente' | 'en progreso' | 'completado';
}

interface AppState {
  contributions: Contribution[];
  monthlyTargets: Record<string, number>;
  selectedInputCurrencyIngresos: 'USD' | 'COP';
  timetableData: TimetableEvent[];
  calendarEventsData: CalendarEvent[];
  workItems: WorkItem[];
  tasks: KanbanTask[];
  universityTasks: UniversityTask[];
  workPackageTemplates: WorkPackageTemplate[];
}

const initialAppState: AppState = {
  contributions: [],
  monthlyTargets: {},
  selectedInputCurrencyIngresos: 'USD',
  timetableData: [],
  calendarEventsData: [],
  workItems: [],
  tasks: [],
  universityTasks: [],
  workPackageTemplates: [
    {
      id: uuidv4(),
      name: 'Amateurs',
      price: 15,
      revisions: 1,
      songLength: 60,
      numberOfInstruments: 5,
      separateFiles: false,
      masterAudio: false,
      projectFileDelivery: false,
      exclusiveLicense: false,
      vocalProduction: false,
    },
    {
      id: uuidv4(),
      name: 'Exclusive',
      price: 30,
      revisions: 2,
      songLength: 180,
      numberOfInstruments: 10,
      separateFiles: true,
      masterAudio: true,
      projectFileDelivery: false,
      exclusiveLicense: true,
      vocalProduction: false,
    },
    {
      id: uuidv4(),
      name: 'Masterpiece',
      price: 60,
      revisions: 3,
      songLength: 240,
      numberOfInstruments: 20,
      separateFiles: true,
      masterAudio: true,
      projectFileDelivery: true,
      exclusiveLicense: true,
      vocalProduction: true,
    }
  ],
};

interface AppStateContextType {
  appState: AppState;
  setAppState: (newState: Partial<AppState> | ((prevState: AppState) => Partial<AppState>)) => void;
  loading: boolean;
  error: string | null;
}

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
          const data = docSnap.data();
          // Default values for fields that might not exist in old data
          setAppState({
            ...initialAppState,
            ...data
          });
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

  const handleSetAppState = (newStateOrFn: Partial<AppState> | ((prevState: AppState) => Partial<AppState>)) => {
    setAppState(prevState => {
      const newState = typeof newStateOrFn === 'function' ? newStateOrFn(prevState) : newStateOrFn;
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
