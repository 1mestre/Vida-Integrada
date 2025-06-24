
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PomodoroTimer from '@/components/productivity/PomodoroTimer';
import TaskManager from '@/components/productivity/TaskManager';
import AmbiancePlayer from '@/components/productivity/AmbiancePlayer';
import ProductivityHeader from '@/components/productivity/ProductivityHeader';
import { Button } from '@/components/ui/button';
import { useAppState, KanbanTask } from '@/context/AppStateContext';
import { useSound } from '@/context/SoundContext';

const ProductivityTab = () => {
  const { appState, setAppState } = useAppState();
  const { playSound } = useSound();

  const handleResetDailyTasks = () => {
    playSound('pomodoroReset');
    const dailyTaskNames = ['Bañarme', 'Ordenar cuarto'];
    
    // Filter out existing daily tasks to avoid duplicates
    const nonDailyTasks = appState.tasks.filter(task => !dailyTaskNames.includes(task.content));

    // Create new daily tasks
    const newDailyTasks: KanbanTask[] = dailyTaskNames.map(name => ({
      id: `daily-task-${name.replace(/\s+/g, '-')}-${Date.now()}`, // Unique ID
      content: name,
      column: 'todo',
    }));

    // Update state
    setAppState({ tasks: [...nonDailyTasks, ...newDailyTasks] });
  };


  return (
    <div className="space-y-8">
      <ProductivityHeader />
      <div className="text-center">
        <Button onClick={handleResetDailyTasks}>Resetear Tareas Diarias</Button>
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
