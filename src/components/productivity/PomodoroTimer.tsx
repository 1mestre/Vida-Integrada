"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductivityCard from './ProductivityCard';
import { Hourglass, Play, Pause, RotateCcw, Settings, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSound } from '@/context/SoundContext';

const PomodoroTimer = () => {
  const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(durations.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSound();

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    
    let nextMode: 'work' | 'shortBreak' | 'longBreak' = 'work';
    let nextCycle = cycle;

    if (mode === 'work') {
      nextCycle++;
      if (nextCycle % 4 === 0) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      nextMode = 'work';
    }
    
    setMode(nextMode);
    setTimeLeft(durations[nextMode] * 60);
    setCycle(nextCycle);
  }, [mode, cycle, durations]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playSound('pomodoroStart');
      resetTimer();
    }
    return () => {
      if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, resetTimer, playSound]);
  
  useEffect(() => {
      if(!isActive) {
        setTimeLeft(durations[mode] * 60);
      }
  }, [durations, mode, isActive]);

  const toggleTimer = () => {
    if (!isActive) {
      playSound('pomodoroStart'); 
    }
    setIsActive(!isActive);
  };

  const handleManualReset = () => {
      playSound('pomodoroReset'); 
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      setMode('work');
      setTimeLeft(durations.work * 60);
      setCycle(0);
  }

  const handleToggleSettings = () => {
    playSound('genericClick');
    setShowSettings(!showSettings);
  }

  const progress = (durations[mode] * 60 - timeLeft) / (durations[mode] * 60) * 100;

  return (
    <ProductivityCard title="Temporizador Pomodoro" icon={<Hourglass className="text-primary"/>}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative h-48 w-48 md:h-64 md:w-64">
            {/* Capa 1: El icono del reloj de fondo (sutil) */}
            <Clock 
                className="absolute w-full h-full text-muted-foreground opacity-10" 
                strokeWidth={1.5} 
            />

            {/* Capa 2: El círculo de progreso SVG */}
            <svg className="absolute h-full w-full" viewBox="0 0 100 100">
                <circle 
                    className="text-muted/30"
                    strokeWidth="7" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="45" 
                    cx="50" 
                    cy="50" 
                />
                <circle
                    className="text-primary"
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={(2 * Math.PI * 45) * (1 - progress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>

            {/* Capa 3: El texto del tiempo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold font-mono">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
                <span className="text-sm uppercase tracking-wider text-muted-foreground">{mode === 'work' ? 'Trabajo' : 'Descanso'}</span>
            </div>
        </div>
        
        <div className="flex space-x-2">
            {Array(4).fill(0).map((_, i) => (
                <div key={i} className={`h-2 w-8 rounded-full ${i < cycle % 4 ? 'bg-primary' : 'bg-muted'}`}></div>
            ))}
        </div>
        <div className="flex space-x-4">
            <Button onClick={toggleTimer} size="lg" className="rounded-full w-20 h-20">
                {isActive ? <Pause className="h-8 w-8"/> : <Play className="h-8 w-8"/>}
            </Button>
            <Button onClick={handleManualReset} variant="outline" size="icon" className="self-end rounded-full"><RotateCcw /></Button>
            <Button onClick={handleToggleSettings} variant="outline" size="icon" className="self-end rounded-full"><Settings /></Button>
        </div>

        {showSettings && (
            <div className="w-full space-y-4 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                    <Label htmlFor="work">Trabajo (min)</Label>
                    <Input id="work" type="number" value={durations.work} onChange={e => setDurations(d => ({...d, work: +e.target.value}))} className="bg-background/30"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="short">Descanso Corto</Label>
                    <Input id="short" type="number" value={durations.shortBreak} onChange={e => setDurations(d => ({...d, shortBreak: +e.target.value}))} className="bg-background/30"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="long">Descanso Largo</Label>
                    <Input id="long" type="number" value={durations.longBreak} onChange={e => setDurations(d => ({...d, longBreak: +e.target.value}))} className="bg-background/30"/>
                </div>
            </div>
        )}
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-ios-orange/10 border border-ios-orange/30 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-ios-orange mt-1 flex-shrink-0" />
            <div>
                <span className="font-bold text-ios-orange">TÁCTICA ANTI-PROCRASTINACIÓN:</span> Aplica la regla de los 2 minutos. Si una tarea toma menos de dos minutos, hazla ahora.
            </div>
        </div>
      </div>
    </ProductivityCard>
  );
};

export default PomodoroTimer;
