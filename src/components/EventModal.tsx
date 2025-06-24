
"use client";

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { useAppState, CalendarEvent, TimetableEvent } from '@/context/AppStateContext';
import { useSound } from '@/context/SoundContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: 'calendar' | 'timetable';
  eventData?: CalendarEvent | TimetableEvent | null;
  selectedDate?: string | null;
}

const COLORS = [
    { name: 'Azul', value: '#0091FF' },
    { name: 'Rojo', value: '#FF4245' },
    { name: 'Púrpura', value: '#DB34F2' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Teal Profundo', value: '#134E4A' },
    { name: 'Dorado Arena', value: '#AA824B' },
];

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, eventType, eventData, selectedDate }) => {
  const { appState, setAppState } = useAppState();
  const { control, handleSubmit, reset, setValue } = useForm();
  const { playSound } = useSound();
  const closeIntent = useRef<'save' | 'delete' | 'cancel'>('cancel');

  useEffect(() => {
    if (isOpen) {
      if (eventData) {
        reset(eventData);
      } else if (eventType === 'calendar' && selectedDate) {
        const nextColorIndex = appState.calendarEventsData.length % COLORS.length;
        const nextColor = COLORS[nextColorIndex].value;
        reset({ title: '', start: selectedDate, color: nextColor, allDay: true });
      } else if (eventType === 'timetable') {
        const nextColorIndex = appState.timetableData.length % COLORS.length;
        const nextColor = COLORS[nextColorIndex].value;
        reset({ title: '', teacher: '', day: DAYS[0], startTime: HOURS[0], endTime: HOURS[1], color: nextColor });
      }
    }
  }, [eventData, selectedDate, eventType, isOpen, reset, appState.calendarEventsData.length, appState.timetableData.length]);
  
  const onSubmit = (data: any) => {
    closeIntent.current = 'save';
    playSound('pomodoroStart'); // Success sound
    if (eventType === 'calendar') {
        const calendarEvents = eventData
            ? appState.calendarEventsData.map(e => e.id === eventData.id ? { ...e, ...data } : e)
            : [...appState.calendarEventsData, { ...data, id: new Date().toISOString() }];
        setAppState({ calendarEventsData: calendarEvents });
    } else { // timetable
        const timetableEvents = eventData
            ? appState.timetableData.map(e => e.id === eventData.id ? { ...e, ...data } : e)
            : [...appState.timetableData, { ...data, id: new Date().toISOString() }];
        setAppState({ timetableData: timetableEvents });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!eventData?.id) return;
    closeIntent.current = 'delete';
    playSound('deleteItem');

    if (eventType === 'timetable') {
        setAppState(prevState => ({
            ...prevState,
            timetableData: prevState.timetableData.filter(e => e.id !== eventData.id)
        }));
    } else { // 'calendar'
        setAppState(prevState => {
            const eventToDelete = prevState.calendarEventsData.find(e => e.id === (eventData as CalendarEvent).id);
            if (!eventToDelete) return prevState;

            // Filter to remove the calendar event
            const updatedEvents = prevState.calendarEventsData.filter(e => e.id !== eventData.id);

            let updatedWorkItems = prevState.workItems;
            let updatedUniversityTasks = prevState.universityTasks;
            let updatedTasks = prevState.tasks;

            // If it's a Work event, cascade delete linked items
            if (eventToDelete.workItemId) {
              updatedWorkItems = prevState.workItems.filter(item => item.id !== eventToDelete.workItemId);
              updatedTasks = prevState.tasks.filter(task => task.workItemId !== eventToDelete.workItemId);
            }

            // If it's a University event, cascade delete linked items
            if (eventToDelete.universityTaskId) {
              updatedUniversityTasks = prevState.universityTasks.filter(item => item.id !== eventToDelete.universityTaskId);
              updatedTasks = prevState.tasks.filter(task => task.universityTaskId !== eventToDelete.universityTaskId);
            }
            
            return {
              ...prevState,
              calendarEventsData: updatedEvents,
              workItems: updatedWorkItems,
              universityTasks: updatedUniversityTasks,
              tasks: updatedTasks
            };
        });
    }
    onClose();
  };


  const handleCancel = () => {
    closeIntent.current = 'cancel';
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (closeIntent.current === 'cancel') {
        playSound('deleteItem'); // "swish" sound for cancel/X
      }
      onClose();
      // Reset intent for the next time the modal is opened
      closeIntent.current = 'cancel';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="glassmorphism-card">
        <DialogHeader>
          <DialogTitle>{eventData ? 'Editar' : 'Nuevo'} Evento de {eventType === 'calendar' ? 'Calendario' : 'Horario'}</DialogTitle>
          <DialogDescription>
            {eventData ? 'Modifica los detalles del evento.' : 'Añade un nuevo evento a tu organizador.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">{eventType === 'timetable' ? 'Asignatura' : 'Título'}</Label>
              <Controller name="title" control={control} rules={{ required: true }} render={({ field }) => <Input id="title" {...field} className="bg-background/30"/>} />
            </div>

            {eventType === 'timetable' && (
              <>
                 <div>
                    <Label htmlFor="teacher">Profesor</Label>
                    <Controller name="teacher" control={control} render={({ field }) => <Input id="teacher" {...field} className="bg-background/30" />} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="day">Día</Label>
                        <Controller name="day" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                    <div>
                        <Label htmlFor="startTime">Hora Inicio</Label>
                         <Controller name="startTime" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                    <div>
                         <Label htmlFor="endTime">Hora Fin</Label>
                         <Controller name="endTime" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                </div>
              </>
            )}

             {eventType === 'calendar' && (
                <div>
                  <Label htmlFor="start">Fecha</Label>
                  <Controller
                    name="start"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value + 'T00:00:00'), "PPP", { locale: es }) : <span>Elige una fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
            )}

            <div>
              <Label htmlFor="color">Color</Label>
              <Controller name="color" control={control} render={({ field }) => (
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COLORS.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border border-neutral-400" style={{ backgroundColor: color.value }}></div>
                                    {color.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
              )} />
            </div>

            <DialogFooter className="pt-4">
                {eventData && <Button type="button" variant="destructive" onClick={handleDelete}>Eliminar</Button>}
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
