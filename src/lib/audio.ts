
"use client";

// A simple utility to play a sound from a URL.
// Caches audio objects to avoid re-creating them.
const audioCache: { [key: string]: HTMLAudioElement } = {};

export const playSound = (url: string, volume: number = 0.5) => {
  if (typeof window === 'undefined') return;
  
  try {
    let audio = audioCache[url];
    if (!audio) {
      audio = new Audio(url);
      audio.volume = volume;
      audioCache[url] = audio;
    }
    
    // If the sound is already playing, rewind it to the start.
    if (!audio.paused) {
        audio.currentTime = 0;
    }

    // Ensure we handle the promise returned by play()
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.error(`Error playing sound: ${url}`, e));
    }

  } catch (e) {
      console.error(`Could not play sound: ${url}`, e)
  }
};
