
"use client";

// A simple utility to play a sound from a URL.
// This approach creates a new Audio object for each playback,
// which is simple and reliable for short UI sounds.
export const playSound = (url: string, volume: number = 0.5) => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => {
      // Log errors but don't crash the app
      console.error(`Error playing sound: ${url}`, e);
    });
  } catch (e) {
      console.error(`Could not create audio for: ${url}`, e)
  }
};
