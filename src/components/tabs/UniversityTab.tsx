
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState, UniversityTask } from '@/context/AppStateContext';
import { Button } from '@/components/ui/button';
import { BookCopy, PlusCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSound } from '@/context/SoundContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import UniversityTaskModal from '../UniversityTaskModal';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

const UniversityTab = () => {
  const { appState, setAppState } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UniversityTask | null>(null);
  const { playSound } = useSound();

  const uniqueSubjects = useMemo(() => {
    const subjects = appState.timetableData.map(item => item.title);
    return [...new Set(subjects)];
  }, [appState.timetableData]);

  const handleSaveTask = (taskData: Omit<UniversityTask, 'id' | 'status'>) => {
    const newUniversityTask: UniversityTask = {
      ...taskData,
      id: `uni-task-${uuidv4()}`,
      status: 'pendiente',
    };

    const newKanbanTask = {
      id: `kanban-${newUniversityTask.id}`,
      content: `Tarea: ${newUniversityTask.subject}`,
      column: 'todo' as const,
      universityTaskId: newUniversityTask.id,
      color: 'bg-purple-950 text-purple-200 border border-purple-800',
    };

    const newCalendarEvent = {
      id: `cal-event-${newUniversityTask.id}`,
      title: `Tarea: ${newUniversityTask.subject}`,
      start: newUniversityTask.dueDate,
      allDay: true,
      color: '#8b5cf6', // purple-500
      backgroundColor: '#581c87', // purple-900
      borderColor: '#a855f7', // purple-600
    };

    setAppState({
      universityTasks: [...appState.universityTasks, newUniversityTask],
      tasks: [...appState.tasks, newKanbanTask],
      calendarEventsData: [...appState.calendarEventsData, newCalendarEvent],
    });
  };
  
  const handleDeleteTask = (taskId: string) => {
      playSound('deleteItem');
      setAppState({
          universityTasks: appState.universityTasks.filter(t => t.id !== taskId),
          tasks: appState.tasks.filter(t => t.universityTaskId !== taskId),
          calendarEventsData: appState.calendarEventsData.filter(e => e.id !== `cal-event-${taskId}`),
      });
  };
  
  const handleStatusChange = (task: UniversityTask, newStatus: UniversityTask['status']) => {
      const statusToColumnMap: Record<UniversityTask['status'], 'todo' | 'inprogress' | 'done'> = {
          pendiente: 'todo',
          'en progreso': 'inprogress',
          completado: 'done',
      };
      
      const updatedUniversityTasks = appState.universityTasks.map(t => 
          t.id === task.id ? { ...t, status: newStatus } : t
      );
      
      const updatedKanbanTasks = appState.tasks.map(k => 
          k.universityTaskId === task.id ? { ...k, column: statusToColumnMap[newStatus] } : k
      );
      
      setAppState({
          universityTasks: updatedUniversityTasks,
          tasks: updatedKanbanTasks,
      });
  };

  const tasksBySubject = useMemo(() => {
    return appState.universityTasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = [];
      }
      acc[task.subject].push(task);
      return acc;
    }, {} as Record<string, UniversityTask[]>);
  }, [appState.universityTasks]);


  const activeHours = useMemo(() => {
    const hoursWithEvents = new Set<string>();
    appState.timetableData.forEach(event => {
      const startIndex = HOURS.indexOf(event.startTime);
      const endIndex = HOURS.indexOf(event.endTime);
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = startIndex; i < endIndex; i++) {
          hoursWithEvents.add(HOURS[i]);
        }
      }
    });
    return hoursWithEvents;
  }, [appState.timetableData]);

  const gridStyle = useMemo(() => {
    const rowHeights = HOURS.map(hour => activeHours.has(hour) ? '4rem' : '1.5rem').join(' ');
    return {
      gridTemplateColumns: '4rem repeat(5, minmax(120px, 1fr))',
      gridTemplateRows: `auto ${rowHeights}`
    };
  }, [activeHours]);
  
  const statusOptions: UniversityTask['status'][] = ['pendiente', 'en progreso', 'completado'];
  const statusColors: Record<UniversityTask['status'], string> = {
      pendiente: 'text-yellow-400',
      'en progreso': 'text-blue-400',
      completado: 'text-green-400',
  }

  return (
    <>
      <div className="space-y-8">
        <Card className="glassmorphism-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex-1"></span>
              <span className="flex-1 text-center">🎓 Horario Universitario</span>
              <div className="flex-1 flex justify-end">
                <Button onClick={() => { playSound('genericClick'); setIsModalOpen(true); }} className="w-auto">
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Añadir Evento
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Grid View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="relative">
                <div className="grid gap-px bg-border/20" style={gridStyle}>
                  <div className="sticky left-0 bg-secondary z-10"></div>
                  {DAYS.map(day => (
                    <div key={day} className="text-center p-2 font-semibold text-sm text-muted-foreground bg-secondary/30 sticky top-0">{day}</div>
                  ))}
                  {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                      <div className="p-2 pr-4 text-xs text-right font-mono text-muted-foreground sticky left-0 bg-secondary z-10 flex items-center justify-end">{hour}</div>
                      {DAYS.map(day => (
                        <div key={`${day}-${hour}`} className="border-t border-l border-border/20"></div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="absolute top-0 left-0 w-full h-full grid gap-px" style={gridStyle}>
                  {appState.timetableData.map(event => (
                    <motion.div
                        key={event.id}
                        className="p-2 rounded-lg text-white text-sm flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                        style={{
                          gridColumnStart: DAYS.indexOf(event.day.toUpperCase()) + 2,
                          gridRowStart: HOURS.indexOf(event.startTime) + 2,
                          gridRowEnd: HOURS.indexOf(event.endTime) + 2,
                          backgroundColor: event.color || '#0091FF',
                          border: event.color === '#171717' ? '1px solid hsl(var(--foreground))' : 'none'
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05, zIndex: 20 }}
                    >
                        <p className="font-bold">{event.title}</p>
                        <p>{event.teacher}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Accordion View */}
            <div className="md:hidden">
              <Accordion type="single" collapsible className="w-full">
                  {DAYS.map(day => {
                      const eventsOnDay = appState.timetableData.filter(e => e.day.toUpperCase() === day);
                      if (eventsOnDay.length === 0) return null;
                      return (
                          <AccordionItem value={day} key={day}>
                              <AccordionTrigger>{day}</AccordionTrigger>
                              <AccordionContent>
                                  <div className="space-y-3">
                                      {eventsOnDay.map(event => (
                                          <motion.div 
                                              key={event.id} 
                                              className="p-3 rounded-lg text-white cursor-pointer" 
                                              style={{
                                                backgroundColor: event.color,
                                                border: event.color === '#171717' ? '1px solid hsl(var(--foreground))' : 'none'
                                              }}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              whileTap={{ scale: 0.95 }}
                                          >
                                              <p className="font-bold">{event.title}</p>
                                              {event.teacher && <p className="text-sm opacity-90">{event.teacher}</p>}
                                              <p className="text-xs mt-1 font-mono">{event.startTime} - {event.endTime}</p>
                                          </motion.div>
                                      ))}
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      )
                  })}
              </Accordion>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism-card">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <BookCopy className="text-primary"/>
                        Tareas Universitarias
                    </div>
                    <Button onClick={() => { playSound('genericClick'); setSelectedTask(null); setIsModalOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Crear Tarea
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-2">
                    {Object.entries(tasksBySubject).map(([subject, tasks]) => (
                        <AccordionItem value={subject} key={subject} className="bg-background/20 rounded-lg border px-4">
                            <AccordionTrigger className="hover:no-underline">{subject} ({tasks.length})</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    {tasks.map(task => (
                                        <div key={task.id} className="p-3 rounded-md bg-secondary/50 border border-border">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-semibold">{task.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Vence: {format(new Date(task.dueDate + 'T00:00:00'), 'PPP', { locale: es })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <Select
                                                        value={task.status}
                                                        onValueChange={(newStatus) => handleStatusChange(task, newStatus as UniversityTask['status'])}
                                                    >
                                                        <SelectTrigger className={`w-[140px] capitalize ${statusColors[task.status]}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusOptions.map(opt => (
                                                                <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleDeleteTask(task.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {appState.universityTasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No hay tareas pendientes.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <UniversityTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        subjects={uniqueSubjects}
        task={selectedTask}
      />
    </>
  );
};

export default UniversityTab;
