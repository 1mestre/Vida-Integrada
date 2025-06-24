
"use client";

import React from 'react';
import PomodoroTimer from '@/components/productivity/PomodoroTimer';
import TaskManager from '@/components/productivity/TaskManager';
import AmbiancePlayer from '@/components/productivity/AmbiancePlayer';
import ProductivityHeader from '@/components/productivity/ProductivityHeader';
import { Button } from '@/components/ui/button';
import { useAppState, KanbanTask } from '@/context/AppStateContext';
import { useSound } from '@/context/SoundContext';
import { v4 as uuidv4 } from 'uuid';
import { Sun, Moon } from 'lucide-react';

const ProductivityTab = () => {
  const { appState, setAppState } = useAppState();
  const { playSound } = useSound();

  const handleResetDayTasks = () => {
    playSound('pomodoroReset');
    const dayTasks = ['Bañarme', 'Ordenar cuarto'];
    
    setAppState(prevState => {
      // Filter out existing daily tasks to avoid duplicates
      const nonDailyTasks = prevState.tasks.filter(task => !dayTasks.includes(task.content));

      // Create new daily tasks
      const newTasks: KanbanTask[] = dayTasks.map(content => ({
        id: uuidv4(),
        content,
        column: 'todo',
        color: 'bg-yellow-950 text-yellow-300 border border-yellow-800',
      }));

      // Update state by returning the partial state
      return { tasks: [...nonDailyTasks, ...newTasks] };
    });
  };

  const handleResetNightTasks = () => {
    const nightlyTasks = ['Cepillarme dientes', 'Manifestar'];

    setAppState(prevState => {
      // 1. Filtra para eliminar las tareas nocturnas antiguas
      const remainingTasks = prevState.tasks.filter(task => !nightlyTasks.includes(task.content));
      
      // 2. Crea las nuevas tareas nocturnas
      const newTasks = nightlyTasks.map(content => ({
        id: uuidv4(),
        content,
        column: 'todo',
        color: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
      }));

      // 3. Devuelve el nuevo estado (partial)
      return { tasks: [...remainingTasks, ...newTasks] };
    });
    playSound('genericClick');
  };


  return (
    <div className="space-y-8">
      <ProductivityHeader />
      <div className="flex justify-center items-center gap-2 my-4">
        <Button variant="outline" size="icon" onClick={handleResetDayTasks} aria-label="Resetear Tareas Diurnas">
          <Sun className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetNightTasks} aria-label="Resetear Tareas Nocturnas">
          <Moon className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>
        <div className="lg:col-span-2">
          <TaskManager />
        </div>
      </div>
      <div>
        <AmbiancePlayer />
      </div>
    </div>
  );
};

export default ProductivityTab;
