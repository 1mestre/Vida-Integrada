"use client";

import React, { useRef, useEffect } from 'react';

declare global {
    interface Window {
        FullCalendar: any;
    }
}

interface FullCalendarProps {
    events: any[];
    onEventClick: (info: any) => void;
    onDateSelect: (info: any) => void;
    onEventDrop?: (info: any) => void;
    selectAllow?: (info: any) => boolean;
    eventAllow?: (dropInfo: any, draggedEvent: any) => boolean;
    eventConstraint?: any;
    selectConstraint?: any;
}

const FullCalendar: React.FC<FullCalendarProps> = ({ events, onEventClick, onDateSelect, onEventDrop, selectAllow, eventAllow, eventConstraint, selectConstraint }) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const calendarInstanceRef = useRef<any>(null);

    const onEventClickRef = useRef(onEventClick);
    onEventClickRef.current = onEventClick;

    const onDateSelectRef = useRef(onDateSelect);
    onDateSelectRef.current = onDateSelect;

    const onEventDropRef = useRef(onEventDrop);
    onEventDropRef.current = onEventDrop;

    useEffect(() => {
        if (window.FullCalendar && calendarRef.current && !calendarInstanceRef.current) {
            const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
                initialView: 'dayGridMonth',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                },
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                weekends: true,
                events: events,
                select: (info: any) => onDateSelectRef.current(info),
                selectAllow: selectAllow ? (info: any) => selectAllow(info) : undefined,
                eventClick: (info: any) => onEventClickRef.current(info),
                eventDrop: (info: any) => onEventDropRef.current && onEventDropRef.current(info),
                eventAllow: eventAllow ? (dropInfo: any, draggedEvent: any) => eventAllow(dropInfo, draggedEvent) : undefined,
                eventConstraint: eventConstraint,
                selectConstraint: selectConstraint,
                height: 'auto',
                contentHeight: 'auto',
                aspectRatio: 1.5,
            });
            calendar.render();
            calendarInstanceRef.current = calendar;
        }

        return () => {
            if (calendarInstanceRef.current) {
                calendarInstanceRef.current.destroy();
                calendarInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty to run only on mount/unmount
    
    useEffect(() => {
        if(calendarInstanceRef.current) {
            calendarInstanceRef.current.removeAllEvents();
            calendarInstanceRef.current.addEventSource(events);
        }
    }, [events]);

    useEffect(() => {
        if(calendarInstanceRef.current) {
            calendarInstanceRef.current.setOption('selectAllow', selectAllow);
        }
    }, [selectAllow]);

    useEffect(() => {
        if(calendarInstanceRef.current) {
            calendarInstanceRef.current.setOption('eventAllow', eventAllow);
        }
    }, [eventAllow]);

    useEffect(() => {
        if(calendarInstanceRef.current) {
            calendarInstanceRef.current.setOption('eventConstraint', eventConstraint);
        }
    }, [eventConstraint]);

    useEffect(() => {
        if(calendarInstanceRef.current) {
            calendarInstanceRef.current.setOption('selectConstraint', selectConstraint);
        }
    }, [selectConstraint]);


    return <div ref={calendarRef} />;
};

export default FullCalendar;
