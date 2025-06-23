"use client";

import React, { useState } from 'react';
import ProductivityCard from './ProductivityCard';
import { ListTodo, Plus, X, Hourglass, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

type Task = { id: number; text: string };
type Status = 'todo' | 'inProgress' | 'done';

const TaskManager = () => {
  const [tasks, setTasks] = useState<{ [key in Status]: Task[] }>({
    todo: [
      { id: 1, text: 'Optimizar perfil de Fiverr' },
      { id: 2, text: 'Bloque de creación musical' },
      { id: 3, text: 'Estudiar libro de administración' },
    ],
    inProgress: [],
    done: [],
  });
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    const newId = Date.now();
    setTasks(prev => ({ ...prev, todo: [...prev.todo, { id: newId, text: newTask }] }));
    setNewTask('');
  };
  
  const handleDeleteTask = (id: number, status: Status) => {
    setTasks(prev => ({
        ...prev,
        [status]: prev[status].filter(task => task.id !== id)
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number, status: Status) => {
      e.dataTransfer.setData("taskId", id.toString());
      e.dataTransfer.setData("sourceStatus", status);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: Status) => {
      e.preventDefault();
      const taskId = parseInt(e.dataTransfer.getData("taskId"));
      const sourceStatus = e.dataTransfer.getData("sourceStatus") as Status;

      if (sourceStatus === targetStatus) return;

      const taskToMove = tasks[sourceStatus].find(t => t.id === taskId);
      if (!taskToMove) return;

      setTasks(prev => ({
          ...prev,
          [sourceStatus]: prev[sourceStatus].filter(t => t.id !== taskId),
          [targetStatus]: [...prev[targetStatus], taskToMove]
      }));
  };

  const Column = ({ title, status, icon, color }: { title: string, status: Status, icon: React.ReactNode, color: string }) => (
    <div 
        className="bg-background/20 rounded-lg p-3 flex-1 min-w-[200px]"
        onDrop={(e) => handleDrop(e, status)}
        onDragOver={(e) => e.preventDefault()}
    >
      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${color}`}>
          {icon} {title}
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
            {tasks[status].map(task => (
                <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, status)}
                    className="bg-secondary p-2 rounded-md text-sm flex justify-between items-center cursor-grab active:cursor-grabbing"
                >
                    <span>{task.text}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id, status)}>
                        <X className="h-3 w-3" />
                    </Button>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <ProductivityCard title="Tareas de Hoy" icon={<ListTodo className="text-primary"/>}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Añadir nueva tarea..."
            className="bg-background/30"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button onClick={handleAddTask}><Plus className="h-4 w-4"/></Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-ios-red/10 border border-ios-red/30 flex gap-2">
            <X className="h-4 w-4 text-ios-red mt-1 flex-shrink-0" />
            <div>
                <span className="font-bold text-ios-red">QUÉ NO HACER HOY:</span> Consumir videos de YouTube, redes sociales sin propósito, procrastinar decisiones.
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <Column title="Por Hacer" status="todo" icon={<Hourglass className="h-4 w-4"/>} color="text-ios-orange"/>
            <Column title="En Progreso" status="inProgress" icon={<Play className="h-4 w-4"/>} color="text-ios-blue"/>
            <Column title="Completadas" status="done" icon={<CheckCircle className="h-4 w-4"/>} color="text-ios-green"/>
        </div>
      </div>
    </ProductivityCard>
  );
};

export default TaskManager;
