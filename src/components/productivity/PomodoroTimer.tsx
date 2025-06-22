"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductivityCard from './ProductivityCard';
import { Hourglass, Play, Pause, RotateCcw, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PomodoroTimer = () => {
  const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(durations.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    }

    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      audioRef.current?.play();
      resetTimer();
    }
    return () => {
      if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, resetTimer]);
  
  useEffect(() => {
      if(!isActive) {
        setTimeLeft(durations[mode] * 60);
      }
  }, [durations, mode, isActive]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleManualReset = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      setMode('work');
      setTimeLeft(durations.work * 60);
      setCycle(0);
  }

  const progress = (durations[mode] * 60 - timeLeft) / (durations[mode] * 60) * 100;

  return (
    <ProductivityCard title="Temporizador Pomodoro" icon={<Hourglass className="text-primary"/>}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative h-48 w-48">
            <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle className="text-muted" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
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
            <Button onClick={() => setShowSettings(!showSettings)} variant="outline" size="icon" className="self-end rounded-full"><Settings /></Button>
        </div>

        {showSettings && (
            <div className="w-full space-y-4 p-4 border border-border rounded-lg">
                <div className="grid grid-cols-3 gap-2 items-center">
                    <Label htmlFor="work">Trabajo (min)</Label>
                    <Input id="work" type="number" value={durations.work} onChange={e => setDurations(d => ({...d, work: +e.target.value}))} className="col-span-2 bg-background/30"/>
                </div>
                 <div className="grid grid-cols-3 gap-2 items-center">
                    <Label htmlFor="short">Descanso Corto</Label>
                    <Input id="short" type="number" value={durations.shortBreak} onChange={e => setDurations(d => ({...d, shortBreak: +e.target.value}))} className="col-span-2 bg-background/30"/>
                </div>
                 <div className="grid grid-cols-3 gap-2 items-center">
                    <Label htmlFor="long">Descanso Largo</Label>
                    <Input id="long" type="number" value={durations.longBreak} onChange={e => setDurations(d => ({...d, longBreak: +e.target.value}))} className="col-span-2 bg-background/30"/>
                </div>
            </div>
        )}
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
                <span className="font-bold text-yellow-400">TÁCTICA ANTI-PROCRASTINACIÓN:</span> Aplica la regla de los 2 minutos. Si una tarea toma menos de dos minutos, hazla ahora.
            </div>
        </div>
      </div>
    </ProductivityCard>
  );
};

export default PomodoroTimer;
