
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ProductivityCard from './ProductivityCard';
import { Music, Power, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type SoundType = 'binaural' | 'white' | 'brown' | 'rain' | 'ocean';

const AmbiancePlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundType, setSoundType] = useState<SoundType>('binaural');
    const [volume, setVolume] = useState(30);
    const [binauralSettings, setBinauralSettings] = useState({ base: 432, beat: 10 });

    // --- Refs for different audio sources ---
    // For Web Audio API (generated sounds)
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const binauralSourcesRef = useRef<{left: OscillatorNode, right: OscillatorNode} | null>(null);
    const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
    // For HTMLAudioElement (file playback)
    const audioFilePlayerRef = useRef<HTMLAudioElement | null>(null);


    const stopSound = useCallback(() => {
        // Stop Web Audio API sources
        if (binauralSourcesRef.current) {
            try {
                binauralSourcesRef.current.left.stop();
                binauralSourcesRef.current.right.stop();
            } catch (e) { /* ignore */ }
            binauralSourcesRef.current = null;
        }
        if (bufferSourceRef.current) {
            try {
                bufferSourceRef.current.stop();
                bufferSourceRef.current.disconnect();
            } catch (e) { /* ignore */ }
            bufferSourceRef.current = null;
        }

        // Stop HTML Audio Element
        if (audioFilePlayerRef.current) {
            audioFilePlayerRef.current.pause();
            audioFilePlayerRef.current = null;
        }
    }, []);
    
    // --- Sound Generation Functions ---

    const startBinaural = useCallback(() => {
        if (!audioContextRef.current || !gainNodeRef.current) return;
        stopSound();

        const leftOsc = audioContextRef.current.createOscillator();
        const rightOsc = audioContextRef.current.createOscillator();
        const pannerL = new StereoPannerNode(audioContextRef.current, { pan: -1 });
        const pannerR = new StereoPannerNode(audioContextRef.current, { pan: 1 });
        
        leftOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(binauralSettings.base - binauralSettings.beat / 2, audioContextRef.current.currentTime);
        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(binauralSettings.base + binauralSettings.beat / 2, audioContextRef.current.currentTime);
        
        leftOsc.connect(pannerL).connect(gainNodeRef.current);
        rightOsc.connect(pannerR).connect(gainNodeRef.current);

        leftOsc.start();
        rightOsc.start();

        binauralSourcesRef.current = { left: leftOsc, right: rightOsc };

    }, [binauralSettings, stopSound]);

    const startNoise = useCallback((type: 'white' | 'brown') => {
        if (!audioContextRef.current || !gainNodeRef.current) return;
        stopSound();

        const bufferSize = 2 * audioContextRef.current.sampleRate;
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
        } else { // Brown noise
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNodeRef.current);
        source.start();
        bufferSourceRef.current = source;
    }, [stopSound]);

    const playAudioFile = useCallback((url: string) => {
        stopSound();
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = volume / 100;
        audio.play().catch(e => console.error("Error al reproducir el audio:", e));
        audioFilePlayerRef.current = audio;
    }, [stopSound, volume]);
    
    const startSound = useCallback(() => {
        stopSound(); // Always stop previous sound first
        
        if (['binaural', 'white', 'brown'].includes(soundType)) {
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                gainNodeRef.current = audioContextRef.current.createGain();
                gainNodeRef.current.connect(audioContextRef.current.destination);
            }
        }

        switch (soundType) {
            case 'binaural': startBinaural(); break;
            case 'white': startNoise('white'); break;
            case 'brown': startNoise('brown'); break;
            case 'rain': playAudioFile('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'); break;
            case 'ocean': playAudioFile('https://actions.google.com/sounds/v1/ambiences/ocean_waves.ogg'); break;
        }
    }, [soundType, startBinaural, startNoise, playAudioFile, stopSound]);

    const togglePlay = () => {
        if (isPlaying) {
            stopSound();
        } else {
           startSound();
        }
        setIsPlaying(!isPlaying);
    };

    // --- Effects ---

    useEffect(() => {
        // Adjust volume for both types of players
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
        }
        if (audioFilePlayerRef.current) {
            audioFilePlayerRef.current.volume = volume / 100;
        }
    }, [volume]);
    
    useEffect(() => {
        // This effect handles changing the sound type or settings *while playing*
        if(isPlaying) {
            startSound();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soundType, binauralSettings]);
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopSound();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        }
    }, [stopSound]);


  return (
    <ProductivityCard title="Sonidos Ambientales" icon={<Music className="text-primary"/>}>
      <div className="grid md:grid-cols-3 gap-6 items-center">
        <div className="space-y-4 md:col-span-1">
            <Button onClick={togglePlay} className="w-full flex items-center gap-2" variant={isPlaying ? 'default' : 'outline'}>
                {isPlaying ? <Power className="h-4 w-4" /> : <Power className="h-4 w-4"/>}
                {isPlaying ? 'Detener' : 'Iniciar'} Sonido
            </Button>
            <Select value={soundType} onValueChange={(v) => setSoundType(v as SoundType)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="binaural">Ondas Binaurales</SelectItem>
                    <SelectItem value="white">Ruido Blanco</SelectItem>
                    <SelectItem value="brown">Ruido Marrón</SelectItem>
                    <SelectItem value="rain">Lluvia</SelectItem>
                    <SelectItem value="ocean">Océano</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-muted-foreground"/>
                <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} />
            </div>
        </div>
        <div className="space-y-4 md:col-span-2">
            {soundType === 'binaural' && (
                <div className="space-y-4 p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-center">Ajustes Binaurales</h4>
                    <div className="space-y-1">
                        <Label>Frecuencia Base (Hz): {binauralSettings.base}</Label>
                        <Slider value={[binauralSettings.base]} onValueChange={(v) => {
                            setBinauralSettings(s => ({...s, base: v[0]}))
                        }} min={100} max={1000} step={1}/>
                    </div>
                     <div className="space-y-1">
                        <Label>Frecuencia Pulso (Hz): {binauralSettings.beat}</Label>
                        <Slider value={[binauralSettings.beat]} onValueChange={(v) => {
                             setBinauralSettings(s => ({...s, beat: v[0]}))
                        }} min={1} max={30} step={0.5}/>
                    </div>
                </div>
            )}
        </div>
      </div>
    </ProductivityCard>
  );
};

export default AmbiancePlayer;
