"use client";

import React, { useRef, useEffect, useState } from 'react';

declare global {
    interface Window {
        FullCalendar: any;
    }
}

interface FullCalendarProps {
    events: any[];
    onEventClick: (info: any) => void;
    onDateSelect: (info: any) => void;
}

const FullCalendar: React.FC<FullCalendarProps> = ({ events, onEventClick, onDateSelect }) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendarInstance, setCalendarInstance] = useState<any>(null);

    useEffect(() => {
        if (window.FullCalendar && calendarRef.current && !calendarInstance) {
            const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
                initialView: 'dayGridMonth',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                },
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                weekends: true,
                events: events,
                select: onDateSelect,
                eventClick: onEventClick,
                height: 'auto',
                contentHeight: 'auto',
                aspectRatio: 1.5,
            });
            calendar.render();
            setCalendarInstance(calendar);
        }

        return () => {
            if (calendarInstance) {
                calendarInstance.destroy();
            }
        };
    }, [calendarRef, calendarInstance, onDateSelect, onEventClick]);
    
    useEffect(() => {
        if(calendarInstance) {
            calendarInstance.removeAllEvents();
            calendarInstance.addEventSource(events);
        }
    }, [events, calendarInstance]);


    return <div ref={calendarRef} />;
};

export default FullCalendar;
