
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversityTask } from '@/context/AppStateContext';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { useSound } from '@/context/SoundContext';

interface UniversityTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UniversityTask, 'id' | 'status'>) => void;
  subjects: string[];
  task?: UniversityTask | null;
}

const UniversityTaskModal: React.FC<UniversityTaskModalProps> = ({ isOpen, onClose, onSubmit, subjects, task }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Omit<UniversityTask, 'id' | 'status'>>();
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen) {
      reset(task || {
        subject: subjects[0] || '',
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [isOpen, task, reset, subjects]);

  const handleFormSubmit = (data: Omit<UniversityTask, 'id' | 'status'>) => {
    playSound('pomodoroStart');
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar' : 'Nueva'} Tarea Universitaria</DialogTitle>
          <DialogDescription>Añade una nueva tarea a tu lista de pendientes académicos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="subject">Materia</Label>
              <Controller
                name="subject"
                control={control}
                rules={{ required: 'La materia es obligatoria' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
            </div>

             <div>
                <Label htmlFor="description">Descripción de la Tarea</Label>
                <Controller
                    name="description"
                    control={control}
                    rules={{ required: 'La descripción es obligatoria' }}
                    render={({ field }) => <Textarea id="description" {...field} />}
                />
                 {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
                <Label htmlFor="dueDate">Fecha de Entrega</Label>
                 <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: 'La fecha es obligatoria' }}
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>}
            </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar Tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UniversityTaskModal;
