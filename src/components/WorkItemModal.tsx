
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState, WorkItem, KanbanTask } from '@/context/AppStateContext';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: WorkItem | null;
}

const PACKAGE_TYPES: WorkItem['packageType'][] = ['Masterpiece', 'Exclusive', 'Amateurs'];
const REMAKE_TYPES: WorkItem['remakeType'][] = ['Original', 'Single Remake', 'Multiple Remakes', 'Original Multiple Beats'];
const DELIVERY_STATUSES: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];

const statusToColumnMap: { [key in WorkItem['deliveryStatus']]?: 'todo' | 'inprogress' | 'done' } = {
  'Pending': 'todo',
  'In Transit': 'inprogress',
  'In Revision': 'inprogress',
  'Delivered': 'done',
  'Returned': 'done',
};

const WorkItemModal: React.FC<WorkItemModalProps> = ({ isOpen, onClose, item }) => {
  const { appState, setAppState } = useAppState();
  const { control, handleSubmit, reset } = useForm<WorkItem>({
    defaultValues: item || {
      id: '',
      clientName: '',
      orderNumber: '',
      deliveryDate: '',
      genre: '',
      packageType: 'Exclusive',
      remakeType: 'Original',
      key: '',
      bpm: '',
      deliveryStatus: 'Pending',
      revisionsRemaining: 1,
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(item || {
        id: new Date().toISOString(),
        clientName: '',
        orderNumber: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        genre: '',
        packageType: 'Exclusive',
        remakeType: 'Original',
        key: '',
        bpm: '',
        deliveryStatus: 'Pending',
        revisionsRemaining: 1,
      });
    }
  }, [isOpen, item, reset]);

  const onSubmit = (data: WorkItem) => {
    let updatedWorkItems: WorkItem[];
    let updatedTasks: KanbanTask[] = [...appState.tasks];

    if (item) { // Editing existing item
      updatedWorkItems = appState.workItems.map(i => i.id === item.id ? { ...i, ...data } : i);
      const newColumn = statusToColumnMap[data.deliveryStatus];
      const taskIndex = updatedTasks.findIndex(t => t.workItemId === item.id);
      if (taskIndex !== -1 && newColumn) {
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], column: newColumn };
      }
    } else { // Creating new item
      const newWorkItem = { ...data, id: new Date().toISOString() };
      updatedWorkItems = [...appState.workItems, newWorkItem];
      
      const newKanbanTask: KanbanTask = {
        id: `task-${newWorkItem.id}`,
        workItemId: newWorkItem.id,
        content: `Producir orden #${newWorkItem.orderNumber} para ${newWorkItem.clientName}`,
        column: 'todo',
      };
      updatedTasks.push(newKanbanTask);
    }
    
    setAppState({ workItems: updatedWorkItems, tasks: updatedTasks });
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    setAppState({ 
      workItems: appState.workItems.filter(i => i.id !== item.id),
      tasks: appState.tasks.filter(t => t.workItemId !== item.id)
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar' : 'Nueva'} Orden</DialogTitle>
          <DialogDescription>Completa los detalles de la orden de producción musical.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] p-1">
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nombre Cliente</Label>
                  <Controller name="clientName" control={control} rules={{ required: true }} render={({ field }) => <Input id="clientName" {...field} />} />
                </div>
                <div>
                  <Label htmlFor="orderNumber">Número de Orden</Label>
                  <Controller name="orderNumber" control={control} rules={{ required: true }} render={({ field }) => <Input id="orderNumber" {...field} />} />
                </div>
              </div>

              <div>
                <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                 <Controller
                  name="deliveryDate"
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="genre">Género</Label>
                    <Controller name="genre" control={control} render={({ field }) => <Input id="genre" {...field} />} />
                </div>
                <div>
                  <Label htmlFor="packageType">Tipo de Paquete</Label>
                  <Controller name="packageType" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PACKAGE_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="remakeType">Tipo de Remake</Label>
                <Controller name="remakeType" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REMAKE_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Tonalidad (Key)</Label>
                  <Controller name="key" control={control} render={({ field }) => <Input id="key" {...field} />} />
                </div>
                <div>
                  <Label htmlFor="bpm">BPM</Label>
                  <Controller name="bpm" control={control} render={({ field }) => <Input id="bpm" {...field} />} />
                </div>
              </div>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="deliveryStatus">Estado de Entrega</Label>
                        <Controller name="deliveryStatus" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{DELIVERY_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        )} />
                    </div>
                     <div>
                        <Label htmlFor="revisionsRemaining">Revisiones Restantes</Label>
                        <Controller name="revisionsRemaining" control={control} render={({ field }) => <Input id="revisionsRemaining" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>} />
                    </div>
                </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 pr-4">
            {item && <Button type="button" variant="destructive" onClick={handleDelete}>Eliminar</Button>}
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkItemModal;
