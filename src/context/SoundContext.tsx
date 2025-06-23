"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';

const soundMap = {
  genericClick: '/sounds/computer-mouse-click-351398.mp3',
  tabChange: '/sounds/spacebar-click-keyboard-199448.mp3',
  deleteItem: '/sounds/high-pitched-bamboo-swish-101368.mp3',
  pomodoroStart: '/sounds/075856_typewriter-bell-amp-carriage-reset-82407.mp3',
  pomodoroReset: '/sounds/wood-crack-2-88687.mp3'
};

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
  const isInitialized = useRef(false);

  // On mobile, AudioContext must be created after a user gesture.
  // This effect sets up a one-time listener to initialize everything on the first tap or click.
  useEffect(() => {
    const initializeAudio = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // Load all sounds in parallel
        await Promise.all(
          Object.keys(soundMap).map(async (name) => {
            const soundName = name as SoundName;
            const path = soundMap[soundName];
            try {
              const response = await fetch(path);
              const arrayBuffer = await response.arrayBuffer();
              const audioBuffer = await context.decodeAudioData(arrayBuffer);
              soundBuffersRef.current.set(soundName, audioBuffer);
            } catch (error) {
              console.error(`Error loading sound "${soundName}" from ${path}:`, error);
            }
          })
        );
      } catch (e) {
        console.error("Failed to initialize AudioContext:", e);
        isInitialized.current = false; // Allow retrying if it fails
      }
    };

    // These listeners will trigger the initialization once, on the first user interaction.
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('touchend', initializeAudio, { once: true });

    return () => {
      // Cleanup listeners and context on unmount
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchend', initializeAudio);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    };
  }, []); // Empty array ensures this setup runs only once.

  const playSound = useCallback((soundName: SoundName) => {
    const context = audioContextRef.current;
    if (!context) {
      console.warn('Audio is not initialized yet. Tap the screen to enable.');
      return;
    }

    // Resume the context if it's suspended (good practice for mobile)
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
      console.warn(`Sound "${soundName}" is not loaded yet.`);
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
