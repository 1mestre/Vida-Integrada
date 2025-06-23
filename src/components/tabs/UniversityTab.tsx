
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from '@/context/AppStateContext';
import EventModal from '@/components/EventModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

const UniversityTab = () => {
  const { appState } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  
  const handleAddNew = () => {
    playSound('https://storage.googleapis.com/hub-sounds/click.mp3');
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

  const gridStyle = { 
    gridTemplateColumns: '4rem repeat(5, minmax(120px, 1fr))', 
    gridTemplateRows: 'auto repeat(18, 4rem)' 
  };

  return (
    <>
      <Card className="glassmorphism-card overflow-hidden">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>🎓 Horario Universitario</span>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Añadir Evento
            </Button>
          </CardTitle>
          <CardDescription>Visualiza y gestiona tu horario de clases y actividades académicas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="relative">
              {/* Base Grid for structure */}
              <div className="grid gap-px bg-border/20" style={gridStyle}>
                {/* Empty corner */}
                <div className="sticky left-0 bg-secondary z-10"></div>
                {/* Day headers */}
                {DAYS.map(day => (
                  <div key={day} className="text-center p-2 font-semibold text-sm text-muted-foreground bg-secondary/30 sticky top-0">{day}</div>
                ))}
                {/* Time slots and grid cells */}
                {HOURS.map(hour => (
                  <React.Fragment key={hour}>
                    <div className="p-2 text-xs text-right font-mono text-muted-foreground sticky left-0 bg-secondary z-10">{hour}</div>
                    {DAYS.map(day => (
                      <div key={`${day}-${hour}`} className="border-t border-l border-border/20"></div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Overlay Grid for events */}
              <div className="absolute top-0 left-0 w-full h-full grid gap-px" style={gridStyle}>
                {appState.timetableData.map(event => (
                  <motion.div
                      key={event.id}
                      className="p-2 rounded-lg text-white text-xs flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                      style={{ ...getGridPosition(event), backgroundColor: event.color || '#0091FF' }}
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
