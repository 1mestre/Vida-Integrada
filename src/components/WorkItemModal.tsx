"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState, WorkItem } from '@/context/AppStateContext';
import { ScrollArea } from './ui/scroll-area';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: WorkItem | null;
}

const PACKAGE_TYPES: WorkItem['packageType'][] = ['Masterpiece', 'Exclusive', 'Amateurs'];
const REMAKE_TYPES: WorkItem['remakeType'][] = ['Original', 'Single Remake', 'Multiple Remakes', 'Original Multiple Beats'];
const DELIVERY_STATUSES: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'Delivered', 'Revised', 'PAYED', 'Returned'];


const WorkItemModal: React.FC<WorkItemModalProps> = ({ isOpen, onClose, item }) => {
  const { appState, setAppState } = useAppState();
  const { control, handleSubmit, reset } = useForm<WorkItem>({
    defaultValues: item || {
      id: new Date().toISOString(),
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
    const workItems = item
      ? appState.workItems.map(i => i.id === item.id ? { ...i, ...data } : i)
      : [...appState.workItems, { ...data, id: new Date().toISOString() }];
    setAppState({ workItems });
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    setAppState({ workItems: appState.workItems.filter(i => i.id !== item.id) });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar' : 'Nuevo'} Ítem de Trabajo</DialogTitle>
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
                <Controller name="deliveryDate" control={control} rules={{ required: true }} render={({ field }) => <Input id="deliveryDate" type="date" {...field} />} />
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
