
"use client";

import React, { useState } from 'react';
import ProductivityCard from './ProductivityCard';
import { ListTodo, Plus, X, Hourglass, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/context/SoundContext'; 
import { useAppState, KanbanTask, WorkItem } from '@/context/AppStateContext';
import StatusUpdateModal from '@/components/StatusUpdateModal';


type ColumnId = 'todo' | 'inprogress' | 'done';

const columnConfig: { [key in ColumnId]: { title: string; icon: React.ReactNode; color: string; } } = {
  todo: { title: "Por Hacer", icon: <Hourglass className="h-4 w-4"/>, color: "text-ios-orange" },
  inprogress: { title: "En Progreso", icon: <Play className="h-4 w-4"/>, color: "text-ios-blue" },
  done: { title: "Completadas", icon: <CheckCircle className="h-4 w-4"/>, color: "text-ios-green" }
};

const TaskManager = () => {
  const { appState, setAppState } = useAppState();
  const [newTaskText, setNewTaskText] = useState('');
  const { playSound } = useSound(); 
  
  // State for the status update modal
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
  
  const handleDeleteTask = (taskToDelete: KanbanTask) => {
    playSound('deleteItem');
    // If the task is linked to a work item, we should probably not delete it,
    // or we should ask for confirmation. For now, we'll prevent deletion.
    if(taskToDelete.workItemId) {
        // Maybe show a toast? For now, just log and do nothing.
        console.log("Cannot delete a task linked to a work item.");
        return;
    }
    setAppState({
        tasks: appState.tasks.filter(task => task.id !== taskToDelete.id)
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
        // Task is linked, open modal to confirm new status
        setTaskToUpdate(task);
        setTargetColumn(targetColumnId);
        setIsModalOpen(true);
      } else {
        // Task is not linked, just move it
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

    // Ensure the new status corresponds to the target column
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
              {tasksInColumn.map(task => (
                  <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-secondary p-2 rounded-md text-sm flex justify-between items-center cursor-grab active:cursor-grabbing"
                  >
                      <span>{task.content}</span>
                      {!task.workItemId && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task)}>
                            <X className="h-3 w-3" />
                        </Button>
                      )}
                  </motion.div>
              ))}
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
