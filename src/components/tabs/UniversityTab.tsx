
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from '@/context/AppStateContext';
import EventModal from '@/components/EventModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSound } from '@/context/SoundContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

const UniversityTab = () => {
  const { appState } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { playSound } = useSound();

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  
  const handleAddNew = () => {
    playSound('genericClick');
    setSelectedEvent(null);
    setModalOpen(true);
  };
  
  const getGridPosition = (event: any) => {
      const startHourIndex = HOURS.indexOf(event.startTime);
      const endHourIndex = HOURS.indexOf(event.endTime);
      const dayIndex = DAYS.indexOf(event.day.toUpperCase());
      
      if (startHourIndex === -1 || endHourIndex === -1 || dayIndex === -1) {
          return {};
      }
      
      return {
          gridColumnStart: dayIndex + 2,
          gridRowStart: startHourIndex + 2,
          gridRowEnd: endHourIndex + 2,
      };
  };
  
  const groupedByDay = useMemo(() => {
    return appState.timetableData.reduce((acc, event) => {
        const day = event.day.toUpperCase();
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(event);
        // Sort events by start time
        acc[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        return acc;
    }, {} as Record<string, typeof appState.timetableData>);
  }, [appState.timetableData]);

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

  return (
    <>
      <Card className="glassmorphism-card overflow-hidden">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>🎓 Horario Universitario</span>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Añadir Evento
            </Button>
          </CardTitle>
          <CardDescription>Visualiza y gestiona tu horario de clases y actividades académicas.</CardDescription>
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
                        ...getGridPosition(event), 
                        backgroundColor: event.color || '#0091FF',
                        border: event.color === '#171717' ? '1px solid hsl(var(--foreground))' : 'none'
                      }}
                      onClick={() => handleEventClick(event)}
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
                {DAYS.map(day => (
                    groupedByDay[day] && groupedByDay[day].length > 0 && (
                        <AccordionItem value={day} key={day}>
                            <AccordionTrigger>{day}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    {groupedByDay[day].map(event => (
                                        <motion.div 
                                            key={event.id} 
                                            onClick={() => handleEventClick(event)} 
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
                ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
      <EventModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        eventType="timetable"
        eventData={selectedEvent}
      />
    </>
  );
};

export default UniversityTab;
