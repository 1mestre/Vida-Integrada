"use client";

// Ruta del archivo: src/context/SoundContext.tsx
import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';

// CORRECCIÓN 1: Nombres de archivo exactos basados en tu captura.
const soundMap = {
  genericClick: '/sounds/computer-mouse-click-351398.mp3',
  tabChange: '/sounds/spacebar-click-keyboard-199448.mp3',
  deleteItem: '/sounds/high-pitched-bamboo-swish-101368.mp3', // Corrected based on file list
  pomodoroStart: '/sounds/075856_typewriter-bell-amp-carriage-reset-82407.mp3', // Corrected based on file list
  pomodoroReset: '/sounds/wood-crack-2-88687.mp3'
};

// Define el tipo para los nombres de los sonidos de forma dinámica
type SoundName = keyof typeof soundMap;

interface SoundContextType {
  playSound: (soundName: SoundName) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<SoundName, AudioBuffer>>(new Map());
  const isInitialized = useRef(false); // Bandera para evitar doble inicialización

  // Hook para inicializar y cargar los sonidos
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeAndLoadSounds = async () => {
      // Crea el AudioContext de forma segura
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const context = audioContextRef.current;

      // Carga cada sonido del soundMap
      for (const soundName in soundMap) {
        const path = soundMap[soundName as SoundName];
        try {
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          soundBuffersRef.current.set(soundName as SoundName, audioBuffer);
        } catch (error) {
          console.error(`Error al cargar el sonido ${path}:`, error);
        }
      }
    };

    initializeAndLoadSounds();

    // Limpia el AudioContext al desmontar el componente
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error al cerrar AudioContext:", e));
      }
    };
  }, []);

  // CORRECCIÓN 2: Función 'playSound' mejorada para manejar políticas de autoplay.
  const playSound = useCallback((soundName: SoundName) => {
    const context = audioContextRef.current;
    if (!context) {
      console.warn('AudioContext no ha sido inicializado.');
      return;
    }

    // "Despierta" el contexto de audio si está suspendido por el navegador
    if (context.state === 'suspended') {
      context.resume();
    }

    const buffer = soundBuffersRef.current.get(soundName);

    if (buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    } else {
      console.warn(`Sonido "${soundName}" no encontrado o aún no cargado.`);
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound debe ser usado dentro de un SoundProvider');
  }
  return context;
};
