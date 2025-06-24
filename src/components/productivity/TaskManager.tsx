
"use client";

import React, { useState } from 'react';
import ProductivityCard from './ProductivityCard';
import { ListTodo, Plus, X, Hourglass, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/context/SoundContext'; 
import { useAppState, KanbanTask, WorkItem, UniversityTask } from '@/context/AppStateContext';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import { cn } from '@/lib/utils';


type ColumnId = 'todo' | 'inprogress' | 'done';

const colorPalette = {
  'Teal Profundo': { bg: 'bg-teal-800', text: 'text-white' },
  'Azul': { bg: 'bg-blue-600', text: 'text-white' },
  'Rojo': { bg: 'bg-red-600', text: 'text-white' },
  'Púrpura': { bg: 'bg-purple-600', text: 'text-white' },
  'Dorado Arena': { bg: 'bg-yellow-700', text: 'text-white' },
  'Blanco': { bg: 'bg-neutral-100', text: 'text-black' },
};

const columnConfig: { [key in ColumnId]: { title: string; icon: React.ReactNode; color: string; } } = {
  todo: { title: "Por Hacer", icon: <Hourglass className="h-4 w-4"/>, color: "text-ios-orange" },
  inprogress: { title: "En Progreso", icon: <Play className="h-4 w-4"/>, color: "text-ios-blue" },
  done: { title: "Completadas", icon: <CheckCircle className="h-4 w-4"/>, color: "text-ios-green" }
};

const columnToUniStatusMap: Record<ColumnId, UniversityTask['status']> = {
    todo: 'pendiente',
    inprogress: 'en progreso',
    done: 'completado'
};

const TaskManager = () => {
  const { appState, setAppState } = useAppState();
  const [newTaskText, setNewTaskText] = useState('');
  const { playSound } = useSound(); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState<KanbanTask | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnId | null>(null);

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    playSound('genericClick');
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      content: newTaskText,
      column: 'todo',
    };
    setAppState({ tasks: [...appState.tasks, newTask] });
    setNewTaskText('');
  };
  
  const handleDeleteTask = (taskId: string) => {
    playSound('deleteItem');
    setAppState(prevState => {
      const taskToDelete = prevState.tasks.find(t => t.id === taskId);
      if (!taskToDelete) {
        console.warn("Se intentó borrar una tarea que no existe:", taskId);
        return prevState;
      }

      const updatedTasks = prevState.tasks.filter(t => t.id !== taskId);

      let updatedWorkItems = prevState.workItems;
      let updatedUniversityTasks = prevState.universityTasks;
      let updatedEvents = prevState.calendarEventsData;

      if (taskToDelete.workItemId) {
        const linkedWorkId = taskToDelete.workItemId;
        updatedWorkItems = prevState.workItems.filter(item => item.id !== linkedWorkId);
        updatedEvents = prevState.calendarEventsData.filter(event => event.workItemId !== linkedWorkId);
      }
      else if (taskToDelete.universityTaskId) {
        const linkedUniId = taskToDelete.universityTaskId;
        updatedUniversityTasks = prevState.universityTasks.filter(item => item.id !== linkedUniId);
        updatedEvents = prevState.calendarEventsData.filter(event => event.universityTaskId !== linkedUniId);
      }

      return {
        ...prevState,
        tasks: updatedTasks,
        workItems: updatedWorkItems,
        universityTasks: updatedUniversityTasks,
        calendarEventsData: updatedEvents,
      };
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: KanbanTask) => {
      e.dataTransfer.setData("taskId", task.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      const task = appState.tasks.find(t => t.id === taskId);

      if (!task || task.column === targetColumnId) return;
      
      playSound('genericClick');

      if (task.workItemId) {
        setTaskToUpdate(task);
        setTargetColumn(targetColumnId);
        setIsModalOpen(true);
      } else if (task.universityTaskId) {
        const newStatus = columnToUniStatusMap[targetColumnId];
        const updatedTasks = appState.tasks.map(t => 
            t.id === taskId ? { ...t, column: targetColumnId } : t
        );
        const updatedUniversityTasks = appState.universityTasks.map(ut => 
            ut.id === task.universityTaskId ? { ...ut, status: newStatus } : ut
        );
        setAppState({ tasks: updatedTasks, universityTasks: updatedUniversityTasks });
      } else {
        const updatedTasks = appState.tasks.map(t => 
            t.id === taskId ? { ...t, column: targetColumnId } : t
        );
        setAppState({ tasks: updatedTasks });
      }
  };
  
  const handleStatusUpdateConfirm = (newStatus: WorkItem['deliveryStatus']) => {
    if (!taskToUpdate || !targetColumn) return;

    const columnMap: { [key in WorkItem['deliveryStatus']]?: ColumnId } = {
        'Pending': 'todo', 'In Transit': 'inprogress', 'In Revision': 'inprogress', 'Delivered': 'done', 'Returned': 'done'
    };

    if (columnMap[newStatus] !== targetColumn) {
        console.error("Status-column mismatch!");
        setIsModalOpen(false);
        return;
    }

    const updatedTasks = appState.tasks.map(t => 
        t.id === taskToUpdate.id ? { ...t, column: targetColumn } : t
    );
    const updatedWorkItems = appState.workItems.map(wi =>
        wi.id === taskToUpdate.workItemId ? { ...wi, deliveryStatus: newStatus } : wi
    );

    setAppState({ tasks: updatedTasks, workItems: updatedWorkItems });
    setIsModalOpen(false);
  };


  const Column = ({ columnId }: { columnId: ColumnId }) => {
    const config = columnConfig[columnId];
    const tasksInColumn = appState.tasks.filter(t => t.column === columnId);
    
    return (
      <div 
          className="bg-background/20 rounded-lg p-3 flex-1 min-w-[200px] md:min-w-0"
          onDrop={(e) => handleDrop(e, columnId)}
          onDragOver={(e) => e.preventDefault()}
      >
        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${config.color}`}>
            {config.icon} {config.title}
        </h3>
        <div className="space-y-2">
          <AnimatePresence>
              {tasksInColumn.map(task => {
                  const taskColor = task.color;
                  let finalColorClasses = 'bg-secondary'; // default
          
                  if (taskColor) {
                      if (colorPalette[taskColor as keyof typeof colorPalette]) {
                          // It's a key from our new palette
                          const styles = colorPalette[taskColor as keyof typeof colorPalette];
                          finalColorClasses = `${styles.bg} ${styles.text}`;
                      } else {
                          // It's an old-style raw class string
                          finalColorClasses = taskColor;
                      }
                  }

                  return (
                      <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className={cn(
                            "p-3 rounded-md text-sm flex justify-between items-center cursor-grab active:cursor-grabbing",
                            finalColorClasses
                          )}
                      >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate">{task.content}</span>
                          </div>

                          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDeleteTask(task.id)}>
                              <X className="h-3 w-3" />
                          </Button>
                      </motion.div>
                  );
              })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <>
    <ProductivityCard title="Tareas de Hoy" icon={<ListTodo className="text-primary"/>}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={newTaskText} 
            onChange={(e) => setNewTaskText(e.target.value)} 
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
            <Column columnId="todo" />
            <Column columnId="inprogress" />
            <Column columnId="done" />
        </div>
      </div>
    </ProductivityCard>

    {taskToUpdate && targetColumn && (
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={taskToUpdate}
        targetColumn={targetColumn}
        onConfirm={handleStatusUpdateConfirm}
      />
    )}
    </>
  );
};

export default TaskManager;
