
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, doc, onSnapshot, setDoc, serverTimestamp } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export interface Contribution {
  id: string;
  date: string;
  netUSDValue: number;
  netCOPValue: number;
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
  quantity?: number;
  separateFiles: boolean;
  masterAudio: boolean;
  projectFileDelivery: boolean;
  exclusiveLicense: boolean;
  vocalProduction: boolean;
  vocalChainPreset: boolean;
  colorClassName: string;
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
  remakeType: 'Single Remake' | 'Multiple Remakes' | 'Original' | 'Original Multiple Beats';
  quantity?: number;

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
  vocalChainPreset: boolean;
}

export interface UniversityTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // Formato 'yyyy-MM-dd'
  status: 'pendiente' | 'en progreso' | 'completado';
}

export type SoundType = 'Kick' | 'Snare' | 'Clap' | 'Hi-Hat' | 'Hi-Hat Open' | 'Perc' | 'Rim' | '808' | 'Bass' | 'FX & Texture' | 'Vocal' | 'Oneshot Melodic' | 'EXTRAS';

export interface SoundLibraryItem {
  id: string;
  originalName: string;
  storageUrl: string;
  soundType: SoundType;
  key: string;
}

export interface DrumKitProject {
  id: number;
  name: string;
  coverArtUrl: string | null;
  imagePrompt: string;
  seoNames: string[];
  soundIds: string[];
  soundNamesInKit: { [soundId: string]: string };
  wordpressProductId?: number | null;
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
  soundLibrary: SoundLibraryItem[];
  drumKitProjects: DrumKitProject[];
  selectedAiModel: 'gemini-2.0-flash' | 'gemini-2.5-flash-preview';
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
      quantity: 1,
      separateFiles: false,
      masterAudio: false,
      projectFileDelivery: false,
      exclusiveLicense: false,
      vocalProduction: false,
      vocalChainPreset: false,
      colorClassName: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: uuidv4(),
      name: 'Exclusive',
      price: 30,
      revisions: 2,
      songLength: 180,
      numberOfInstruments: 10,
      quantity: 1,
      separateFiles: true,
      masterAudio: true,
      projectFileDelivery: false,
      exclusiveLicense: true,
      vocalProduction: false,
      vocalChainPreset: false,
      colorClassName: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: uuidv4(),
      name: 'Masterpiece',
      price: 60,
      revisions: 3,
      songLength: 240,
      numberOfInstruments: 20,
      quantity: 1,
      separateFiles: true,
      masterAudio: true,
      projectFileDelivery: true,
      exclusiveLicense: true,
      vocalProduction: false,
      vocalChainPreset: false,
      colorClassName: 'bg-green-600 hover:bg-green-700',
    }
  ],
  soundLibrary: [],
  drumKitProjects: [],
  selectedAiModel: 'gemini-2.5-flash-preview',
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
          
          const sanitizedSoundLibrary = (data.soundLibrary || []).reduce((acc: SoundLibraryItem[], item: Partial<SoundLibraryItem>) => {
            if (item && typeof item.storageUrl === 'string' && item.storageUrl.startsWith('http')) {
              const defaults: Omit<SoundLibraryItem, 'id'> = {
                originalName: 'sonido_desconocido.wav',
                storageUrl: '',
                soundType: 'EXTRAS',
                key: '',
              };
              const completeItem: SoundLibraryItem = {
                  ...defaults,
                  ...item,
                  id: item.id || uuidv4(),
                  storageUrl: item.storageUrl,
                  key: item.key || '', // Ensure key is always a string
              };
              acc.push(completeItem);
            }
            return acc;
          }, []);

          // --- Comprehensive Sanitization ---
          const sanitizedContributions = (data.contributions || []).map((c: any): Contribution => ({
            id: c.id || uuidv4(),
            date: c.date || new Date().toISOString(),
            netUSDValue: c.netUSDValue ?? c.netUSD ?? 0,
            netCOPValue: c.netCOPValue ?? c.netCOP ?? 0,
          }));

          const sanitizedWorkItems = (data.workItems || []).map((item: Partial<WorkItem>): WorkItem => {
            const defaults: Omit<WorkItem, 'id'> = {
              clientName: '', orderNumber: '', deliveryDate: format(new Date(), 'yyyy-MM-dd'),
              genre: '', bpm: '', key: 'C or Am', deliveryStatus: 'Pending', remakeType: 'Single Remake',
              packageName: 'Amateurs', price: 0, revisionsRemaining: 0, songLength: 0,
              numberOfInstruments: 0, separateFiles: false, masterAudio: false, projectFileDelivery: false,
              exclusiveLicense: false, vocalProduction: false, vocalChainPreset: false,
              quantity: 1,
            };
            return { ...defaults, ...item, id: item.id || uuidv4() };
          });

          const sanitizedUniversityTasks = (data.universityTasks || []).map((task: Partial<UniversityTask>): UniversityTask => {
              const defaults: Omit<UniversityTask, 'id'> = {
                  subject: 'Materia Desconocida', title: 'Tarea sin título', description: '',
                  dueDate: format(new Date(), 'yyyy-MM-dd'), status: 'pendiente',
              };
              return { ...defaults, ...task, id: task.id || uuidv4() };
          });

          const sanitizedCalendarEvents = (data.calendarEventsData || []).map((event: Partial<CalendarEvent>): CalendarEvent => {
              const defaults: Omit<CalendarEvent, 'id'> = {
                  title: 'Evento sin título', start: format(new Date(), 'yyyy-MM-dd'),
                  allDay: true, color: '#0091FF',
              };
              return { ...defaults, ...event, id: event.id || uuidv4() };
          });
          
          const sanitizedTasks = (data.tasks || []).map((task: Partial<KanbanTask>): KanbanTask => {
              const defaults: Omit<KanbanTask, 'id'> = {
                  content: 'Tarea sin contenido', column: 'todo',
              };
              return { ...defaults, ...task, id: task.id || uuidv4() };
          });
          
          const sanitizedTemplates = (data.workPackageTemplates || initialAppState.workPackageTemplates).map((template: Partial<WorkPackageTemplate>): WorkPackageTemplate => {
              const defaults: Omit<WorkPackageTemplate, 'id' | 'colorClassName'> = {
                name: 'Plantilla sin nombre', price: 0, revisions: 0, songLength: 0, numberOfInstruments: 0,
                separateFiles: false, masterAudio: false, projectFileDelivery: false, exclusiveLicense: false,
                vocalProduction: false, vocalChainPreset: false,
                quantity: 1,
              };
              return { ...defaults, ...template, id: template.id || uuidv4(), colorClassName: template.colorClassName || 'bg-gray-500' };
          });
          
          const sanitizedDrumKitProjects = (data.drumKitProjects || []).map((project: any): DrumKitProject => {
            const defaults: Omit<DrumKitProject, 'id'> = {
                name: 'Nuevo Kit', coverArtUrl: null, imagePrompt: '', seoNames: [],
                soundIds: [], soundNamesInKit: {},
            };
        
            const migratedProject: DrumKitProject = { 
                ...defaults, 
                ...project, 
                id: project.id || Date.now(),
                soundIds: project.soundIds || [],
                soundNamesInKit: project.soundNamesInKit || {},
            };
        
            if (project.sounds && Array.isArray(project.sounds) && project.sounds.length > 0) {
                migratedProject.soundIds = [];
                migratedProject.soundNamesInKit = {};
                project.sounds.forEach((soundObj: any) => {
                    if (soundObj && soundObj.soundId) {
                        migratedProject.soundIds.push(soundObj.soundId);
                        migratedProject.soundNamesInKit[soundObj.soundId] = soundObj.nameInKit || 'Migrated';
                    }
                });
            }
            
            delete (migratedProject as any).sounds;
        
            return migratedProject;
        });

          const sanitizedState: AppState = {
            contributions: sanitizedContributions,
            monthlyTargets: data.monthlyTargets || initialAppState.monthlyTargets,
            selectedInputCurrencyIngresos: data.selectedInputCurrencyIngresos || initialAppState.selectedInputCurrencyIngresos,
            timetableData: data.timetableData || initialAppState.timetableData,
            calendarEventsData: sanitizedCalendarEvents,
            workItems: sanitizedWorkItems,
            tasks: sanitizedTasks,
            universityTasks: sanitizedUniversityTasks,
            workPackageTemplates: sanitizedTemplates.length > 0 ? sanitizedTemplates : initialAppState.workPackageTemplates,
            soundLibrary: sanitizedSoundLibrary,
            drumKitProjects: sanitizedDrumKitProjects,
            selectedAiModel: data.selectedAiModel || initialAppState.selectedAiModel,
          };
          
          setAppState(sanitizedState);
        } else {
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
        const stateToSave = JSON.parse(JSON.stringify(updatedState));
        setDoc(docRef, { 
          ...stateToSave,
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
