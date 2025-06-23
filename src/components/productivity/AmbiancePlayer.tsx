
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

    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    
    // Use separate refs for different types of audio sources for robust stop/start
    const binauralSourcesRef = useRef<{left: OscillatorNode, right: OscillatorNode} | null>(null);
    const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopSound = useCallback(() => {
        // Stop and disconnect any existing binaural oscillators
        if (binauralSourcesRef.current) {
            try {
                binauralSourcesRef.current.left.stop();
                binauralSourcesRef.current.left.disconnect();
                binauralSourcesRef.current.right.stop();
                binauralSourcesRef.current.right.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
            binauralSourcesRef.current = null;
        }
        // Stop and disconnect any existing buffer source
        if (bufferSourceRef.current) {
            try {
                bufferSourceRef.current.stop();
                bufferSourceRef.current.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
            bufferSourceRef.current = null;
        }
    }, []);
    
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
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
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

    const playAudioFile = useCallback(async (url: string) => {
        if (!audioContextRef.current || !gainNodeRef.current) return;
        stopSound();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(gainNodeRef.current);
            source.start();
            bufferSourceRef.current = source;
        } catch(e) {
            console.error(`Error playing audio file: ${url}`, e)
        }
    }, [stopSound]);
    
    const startSound = useCallback(() => {
        if(soundType === 'binaural') startBinaural();
        if(soundType === 'white') startNoise('white');
        if(soundType === 'brown') startNoise('brown');
        if(soundType === 'rain') playAudioFile('https://www.soundjay.com/nature/rain-07.mp3');
        if(soundType === 'ocean') playAudioFile('https://www.soundjay.com/nature/ocean-wave-1.mp3');
    }, [soundType, startBinaural, startNoise, playAudioFile]);

    const togglePlay = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
        }

        if (isPlaying) {
            stopSound();
        } else {
           startSound();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
        }
    }, [volume]);
    
    useEffect(() => {
        if(isPlaying) {
            startSound();
        } else {
            stopSound();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soundType, binauralSettings]);
    
    useEffect(() => {
        // Cleanup on unmount
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
            <Select value={soundType} onValueChange={(v) => {
                setSoundType(v as SoundType)
                if(isPlaying) {
                    // If it was already playing, restart with new sound
                    startSound();
                }
            }}>
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
