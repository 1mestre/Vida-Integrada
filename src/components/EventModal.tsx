"use client";

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { useAppState } from '@/context/AppStateContext';
import { useSound } from '@/context/SoundContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: 'calendar' | 'timetable';
  eventData?: any | null;
  selectedDate?: string | null;
}

const COLORS = [
    { name: 'Azul', value: '#0091FF' },
    { name: 'Rojo', value: '#FF4245' },
    { name: 'Púrpura', value: '#DB34F2' },
    { name: 'Carbón', value: '#171717' },
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
    if (eventData) {
      reset(eventData);
    } else if (eventType === 'calendar' && selectedDate) {
      reset({ title: '', start: selectedDate, color: COLORS[0].value, allDay: true });
    } else {
      reset({ title: '', teacher: '', day: DAYS[0], startTime: HOURS[0], endTime: HOURS[1], color: COLORS[0].value });
    }
  }, [eventData, selectedDate, eventType, isOpen, reset]);
  
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
    if(!eventData) return;
    closeIntent.current = 'delete';
    playSound('deleteItem');
    if (eventType === 'calendar') {
        setAppState({ calendarEventsData: appState.calendarEventsData.filter(e => e.id !== eventData.id) });
    } else {
        setAppState({ timetableData: appState.timetableData.filter(e => e.id !== eventData.id) });
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
                    <Controller name="start" control={control} rules={{ required: true }} render={({ field }) => <Input id="start" type="date" {...field} className="bg-background/30"/>} />
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
