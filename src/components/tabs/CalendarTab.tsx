"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FullCalendar from '@/components/FullCalendar';
import { useAppState, CalendarEvent } from '@/context/AppStateContext';
import EventModal from '@/components/EventModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSound } from '@/context/SoundContext';
import { format, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';


const ProgressBar = ({ label, value, textColorClass, barClassName }: { label: string; value: number; textColorClass: string; barClassName: string; }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${textColorClass}`}>{value.toFixed(2)}%</p>
    </div>
    <Progress value={value} className={`h-2 ${barClassName}`} />
  </div>
);

const CalendarTab = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { playSound } = useSound();

  const { appState, setAppState } = useAppState();

  useEffect(() => {
    setTime(new Date());
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const { yearProgress, monthProgress, dayProgress } = useMemo(() => {
    if (!time) {
      return { yearProgress: 0, monthProgress: 0, dayProgress: 0 };
    }
    const startOfYear = new Date(time.getFullYear(), 0, 1);
    const endOfYear = new Date(time.getFullYear(), 11, 31);
    const yearProgress = ((time.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;

    const endOfMonth = new Date(time.getFullYear(), time.getMonth() + 1, 0);
    const monthProgress = time.getDate() > 1 ? ((time.getDate() - 1) / (endOfMonth.getDate() - 1)) * 100 : 0;

    const dayProgress = (time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds()) / 86400 * 100;
    
    return { yearProgress, monthProgress, dayProgress };
  }, [time]);

  const calendarEventsForFc = useMemo(() => {
    return appState.calendarEventsData.map(event => ({
      ...event,
      extendedProps: {
        workItemId: event.workItemId,
        universityTaskId: event.universityTaskId,
      },
      backgroundColor: event.backgroundColor || event.color,
      borderColor: event.borderColor || (event.color === '#171717' ? 'hsl(var(--foreground))' : (event.backgroundColor || event.color)),
      textColor: event.color === '#FFFFFF' ? '#000000' : '#FFFFFF',
    }));
  }, [appState.calendarEventsData]);
  
  const handleEventClick = useCallback((clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const event = appState.calendarEventsData.find(e => e.id === eventId);
    if(event) {
        setSelectedEvent(event);
        setSelectedDate(null);
        setModalOpen(true);
    }
  }, [appState.calendarEventsData]);

  const handleDateSelect = useCallback((selectInfo: any) => {
    setSelectedEvent(null);
    setSelectedDate(selectInfo.startStr);
    setModalOpen(true);
  }, []);
  
  const handleEventDrop = useCallback((dropInfo: any) => {
    const { event } = dropInfo;
    const newDate = format(event.start!, 'yyyy-MM-dd');
    const eventId = event.id;
    const { workItemId, universityTaskId } = event.extendedProps;

    setAppState(prevState => {
      const updatedEvents = prevState.calendarEventsData.map(e => 
        e.id === eventId ? { ...e, start: newDate } : e
      );

      let updatedWorkItems = prevState.workItems;
      if (workItemId) {
        updatedWorkItems = prevState.workItems.map(item =>
          item.id === workItemId ? { ...item, deliveryDate: newDate } : item
        );
      }

      let updatedUniversityTasks = prevState.universityTasks;
      if (universityTaskId) {
        updatedUniversityTasks = prevState.universityTasks.map(item =>
          item.id === universityTaskId ? { ...item, dueDate: newDate } : item
        );
      }

      return { 
        ...prevState,
        calendarEventsData: updatedEvents, 
        workItems: updatedWorkItems,
        universityTasks: updatedUniversityTasks 
      };
    });
  }, [setAppState]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const todaysEvents = useMemo(() => 
    calendarEventsForFc.filter(event => event.start === todayStr),
    [calendarEventsForFc, todayStr]
  );

  const handleNewActivity = () => {
    playSound('genericClick');
    setSelectedEvent(null); 
    setSelectedDate(todayStr); 
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card className="glassmorphism-card">
            <CardHeader>
              <CardTitle>📅 Calendario de Actividades</CardTitle>
              <CardDescription>Organiza tu tiempo y mantente al día.</CardDescription>
            </CardHeader>
            <CardContent>
              <FullCalendar 
                events={calendarEventsForFc}
                onEventClick={handleEventClick}
                onDateSelect={handleDateSelect}
                onEventDrop={handleEventDrop}
                selectable={true}
                editable={true}
                selectAllow={(selectInfo) => {
                  const timeZone = 'America/Bogota';
                  const today = startOfDay(toZonedTime(new Date(), timeZone));
                  return selectInfo.start >= today;
                }}
                eventAllow={(dropInfo, draggedEvent) => {
                  const timeZone = 'America/Bogota';
                  const today = startOfDay(toZonedTime(new Date(), timeZone));
                  return dropInfo.start >= today;
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="glassmorphism-card">
            <CardHeader>
              <CardTitle>⏳ Progreso del Tiempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar label="Año" value={yearProgress} textColorClass="text-ios-green" barClassName="[&>div]:bg-ios-green" />
              <ProgressBar label="Mes" value={monthProgress} textColorClass="text-ios-blue" barClassName="[&>div]:bg-ios-blue" />
              <ProgressBar label="Día" value={dayProgress} textColorClass="text-ios-orange" barClassName="[&>div]:bg-ios-orange" />
            </CardContent>
          </Card>
           <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle>📝 Actividades para Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysEvents.length > 0 ? (
                  <ul className="space-y-3">
                    <AnimatePresence>
                      {todaysEvents.map((event, index) => (
                        <motion.li 
                          key={event.id} 
                          className="flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <span
                            className="h-2 w-2 rounded-full mr-3 flex-shrink-0"
                            style={{
                              backgroundColor: event.backgroundColor,
                              border: `1px solid ${event.borderColor}`,
                              boxSizing: 'border-box'
                            }}
                          ></span>
                          <span className="text-sm">{event.title}</span>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay actividades programadas para hoy.</p>
                )}
                 <Button className="w-full mt-6" onClick={handleNewActivity}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Actividad
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
      <EventModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        eventType="calendar"
        eventData={selectedEvent}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default CalendarTab;
