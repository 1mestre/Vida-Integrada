
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState, WorkItem, KanbanTask, CalendarEvent } from '@/context/AppStateContext';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from './ui/switch';
import { useSound } from '@/context/SoundContext';
import { Slider } from './ui/slider';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: WorkItem | null;
}

const DELIVERY_STATUSES: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];

const keyOptions = [
  { value: 'C or Am', label: 'C Maj or A min' },
  { value: 'G or Em', label: 'G Maj or E min' },
  { value: 'D or Bm', label: 'D Maj or B min' },
  { value: 'A or F#m', label: 'A Maj or F# min' },
  { value: 'E or C#m', label: 'E Maj or C# min' },
  { value: 'B or G#m', label: 'B Maj or G# min' },
  { value: 'F# or D#m', label: 'F# Maj or D# min' },
  { value: 'Db or Bbm', label: 'Db Maj or Bb min' },
  { value: 'Ab or Fm', label: 'Ab Maj or F min' },
  { value: 'Eb or Cm', label: 'Eb Maj or C min' },
  { value: 'Bb or Gm', label: 'Bb Maj or G min' },
  { value: 'F or Dm', label: 'F Maj or D min' }
];

const remakeTypeOptions: { value: WorkItem['remakeType'], label: string }[] = [
    { value: 'Single Remake', label: 'Single Remake' },
    { value: 'Multiple Remakes', label: 'Multiple Remakes' },
    { value: 'Original', label: 'Original' },
    { value: 'Original Multiple Beats', label: 'Original Multiple Beats' },
];

const statusToColumnMap: { [key in WorkItem['deliveryStatus']]?: 'todo' | 'inprogress' | 'done' } = {
  'Pending': 'todo',
  'In Transit': 'inprogress',
  'In Revision': 'inprogress',
  'Delivered': 'done',
  'Returned': 'done',
};

const WorkItemModal: React.FC<WorkItemModalProps> = ({ isOpen, onClose, item }) => {
  const { appState, setAppState } = useAppState();
  const { playSound } = useSound();
  const form = useForm<WorkItem & { packageTemplateId?: string }>();

  const { control, handleSubmit, reset, watch, setValue } = form;
  const selectedTemplateId = watch('packageTemplateId');
  const remakeType = watch('remakeType');
  const isMultiple = remakeType?.includes('Multiple');


  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({ ...item, packageTemplateId: '' });
      } else {
        const defaultTemplate = appState.workPackageTemplates[0];

        const newWorkItemData: WorkItem & { packageTemplateId?: string } = {
            id: uuidv4(),
            clientName: '',
            orderNumber: '',
            deliveryDate: format(new Date(), 'yyyy-MM-dd'),
            genre: '',
            bpm: '',
            key: keyOptions[0].value,
            deliveryStatus: 'Pending',
            remakeType: 'Single Remake',
            quantity: 1,
            packageName: 'Custom',
            price: 0,
            revisionsRemaining: 0,
            songLength: 0,
            numberOfInstruments: 0,
            separateFiles: false,
            masterAudio: false,
            projectFileDelivery: false,
            exclusiveLicense: false,
            vocalProduction: false,
            vocalChainPreset: false,
            packageTemplateId: '',
        };

        if (defaultTemplate) {
          newWorkItemData.packageName = defaultTemplate.name;
          newWorkItemData.price = defaultTemplate.price;
          newWorkItemData.revisionsRemaining = defaultTemplate.revisions;
          newWorkItemData.songLength = defaultTemplate.songLength;
          newWorkItemData.numberOfInstruments = defaultTemplate.numberOfInstruments;
          newWorkItemData.quantity = defaultTemplate.quantity || 1;
          newWorkItemData.separateFiles = defaultTemplate.separateFiles;
          newWorkItemData.masterAudio = defaultTemplate.masterAudio;
          newWorkItemData.projectFileDelivery = defaultTemplate.projectFileDelivery;
          newWorkItemData.exclusiveLicense = defaultTemplate.exclusiveLicense;
          newWorkItemData.vocalProduction = defaultTemplate.vocalProduction;
          newWorkItemData.vocalChainPreset = defaultTemplate.vocalChainPreset;
          newWorkItemData.packageTemplateId = defaultTemplate.id;
        }
        
        reset(newWorkItemData);
      }
    }
  }, [isOpen, item, reset, appState.workPackageTemplates]);
  
  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = appState.workPackageTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setValue('packageName', template.name);
      setValue('price', template.price);
      setValue('revisionsRemaining', template.revisions);
      setValue('songLength', template.songLength);
      setValue('numberOfInstruments', template.numberOfInstruments);
      setValue('quantity', template.quantity || 1);
      setValue('separateFiles', template.separateFiles);
      setValue('masterAudio', template.masterAudio);
      setValue('projectFileDelivery', template.projectFileDelivery);
      setValue('exclusiveLicense', template.exclusiveLicense);
      setValue('vocalProduction', template.vocalProduction);
      setValue('vocalChainPreset', template.vocalChainPreset);
    }
  }, [selectedTemplateId, appState.workPackageTemplates, setValue]);


  const onSubmit = (data: WorkItem) => {
    playSound('pomodoroStart');
    setAppState(prevState => {
      let updatedWorkItems: WorkItem[];
      let updatedTasks: KanbanTask[] = [...prevState.tasks];
      let updatedCalendarEvents: CalendarEvent[] = [...prevState.calendarEventsData];

      if (item) { // Editing existing item
        updatedWorkItems = prevState.workItems.map(i => i.id === item.id ? { ...i, ...data } : i);
        
        const newColumn = statusToColumnMap[data.deliveryStatus];
        const taskIndex = updatedTasks.findIndex(t => t.workItemId === item.id);
        if (taskIndex !== -1 && newColumn) {
          updatedTasks[taskIndex] = { 
              ...updatedTasks[taskIndex], 
              column: newColumn,
              content: `Orden de ${data.clientName}`,
          };
        }

        const eventIndex = updatedCalendarEvents.findIndex(e => e.workItemId === item.id);
        if (eventIndex !== -1) {
            updatedCalendarEvents[eventIndex] = {
                ...updatedCalendarEvents[eventIndex],
                title: `${data.clientName} orden`,
                start: data.deliveryDate,
            };
        }

      } else { // Creating new item
        const newWorkItem = { ...data, id: uuidv4() };
        updatedWorkItems = [...prevState.workItems, newWorkItem];
        
        const newKanbanTask: KanbanTask = {
          id: `task-${newWorkItem.id}`,
          workItemId: newWorkItem.id,
          content: `Orden de ${newWorkItem.clientName}`,
          column: 'todo',
          color: 'bg-emerald-950 text-emerald-200 border border-emerald-800',
        };
        updatedTasks.push(newKanbanTask);

        const newCalendarEvent: CalendarEvent = {
            id: `event-${newWorkItem.id}`,
            workItemId: newWorkItem.id,
            title: `${newWorkItem.clientName} orden`,
            start: newWorkItem.deliveryDate,
            allDay: true,
            color: '#134E4A',
            backgroundColor: '#134E4A',
            borderColor: '#0F766E'
        };
        updatedCalendarEvents.push(newCalendarEvent);
      }
      
      return { 
        ...prevState,
        workItems: updatedWorkItems, 
        tasks: updatedTasks, 
        calendarEventsData: updatedCalendarEvents 
      };
    });
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    setAppState(prevState => ({
      ...prevState,
      workItems: prevState.workItems.filter(i => i.id !== item.id),
      tasks: prevState.tasks.filter(t => t.workItemId !== item.id),
      calendarEventsData: prevState.calendarEventsData.filter(e => e.workItemId !== item.id)
    }));
    onClose();
  };

  const DeliverableSwitch = ({ name, label }: { name: keyof WorkItem, label: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name as any}
        control={control}
        render={({ field }) => (
          <Switch
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar' : 'Nueva'} Orden</DialogTitle>
          <DialogDescription>Completa los detalles de la orden de producción musical.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[70vh] p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4">
              {/* Columna Izquierda: Datos Principales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Detalles del Cliente y Orden</h3>
                 <div>
                  <Label htmlFor="clientName">👤 Nombre Cliente</Label>
                  <Controller name="clientName" control={control} rules={{ required: true }} render={({ field }) => <Input id="clientName" {...field} />} />
                </div>
                <div>
                  <Label htmlFor="orderNumber">📄 Número de Orden</Label>
                  <Controller name="orderNumber" control={control} rules={{ required: true }} render={({ field }) => <Input id="orderNumber" {...field} />} />
                </div>
                 <div>
                  <Label htmlFor="remakeType">🎛️ Tipo de Remake</Label>
                  <Controller name="remakeType" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{remakeTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                {isMultiple && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity">🔢 Cantidad de Entregables ({watch('quantity') || 1})</Label>
                    <Controller
                      name="quantity"
                      control={control}
                      defaultValue={1}
                      render={({ field }) => (
                        <Slider
                          id="quantity"
                          min={2}
                          max={10}
                          step={1}
                          value={[field.value || 2]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      )}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="deliveryDate">🗓️ Fecha de Entrega</Label>
                   <Controller
                    name="deliveryDate" control={control} rules={{ required: true }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value + 'T00:00:00'), "PPP", { locale: es }) : <span>Elige una fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ? new Date(field.value + 'T00:00:00') : undefined} onSelect={(date) => date && field.onChange(format(date, 'yyyy-MM-dd'))} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus /></PopoverContent>
                      </Popover>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <Label htmlFor="genre">{isMultiple ? "🎶 Géneros (separados por coma)" : "🎶 Género"}</Label>
                      <Controller name="genre" control={control} render={({ field }) => <Input id="genre" {...field} />} />
                  </div>
                  <div>
                    <Label htmlFor="bpm">{isMultiple ? "⏱️ BPMs (separados por coma)" : "⏱️ BPM"}</Label>
                    <Controller name="bpm" control={control} render={({ field }) => <Input id="bpm" {...field} />} />
                  </div>
                </div>
                 <div>
                    <Label htmlFor="key">{isMultiple ? "🎹 Tonalidades" : "🎹 Tonalidad (Key)"}</Label>
                    {isMultiple ? (
                        <Controller name="key" control={control} render={({ field }) => 
                            <Input id="key" {...field} placeholder="Tonalidades (separadas por coma ,)" />
                        } />
                    ) : (
                        <Controller name="key" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{keyOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    )}
                </div>
                 <div>
                    <Label htmlFor="deliveryStatus">🚚 Estado de Entrega</Label>
                    <Controller name="deliveryStatus" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DELIVERY_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    )} />
                </div>
              </div>

              {/* Columna Derecha: Paquete y Entregables */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">📦 Detalles del Paquete</h3>
                <div>
                    <Label htmlFor="packageTemplateId">🏷️ Plantilla de Paquete</Label>
                    <Controller name="packageTemplateId" control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar plantilla..." /></SelectTrigger>
                                <SelectContent>
                                    {appState.workPackageTemplates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">💰 Precio (USD)</Label>
                        <Controller name="price" control={control} render={({ field }) => <Input id="price" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>} />
                    </div>
                    <div>
                        <Label htmlFor="revisionsRemaining">🔄 Revisiones</Label>
                        <Controller name="revisionsRemaining" control={control} render={({ field }) => <Input id="revisionsRemaining" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="songLength">⏳ Duración (seg)</Label>
                        <Controller name="songLength" control={control} render={({ field }) => <Input id="songLength" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>} />
                    </div>
                    <div>
                        <Label htmlFor="numberOfInstruments">🎸 # Instrumentos</Label>
                        <Controller name="numberOfInstruments" control={control} render={({ field }) => <Input id="numberOfInstruments" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>} />
                    </div>
                </div>

                <h3 className="text-lg font-semibold border-b pb-2 pt-4">🎁 Entregables</h3>
                <div className="space-y-2">
                    <DeliverableSwitch name="masterAudio" label="Audio Masterizado" />
                    <DeliverableSwitch name="separateFiles" label="Archivos Separados (STEMS)" />
                    <DeliverableSwitch name="projectFileDelivery" label="Archivo de Proyecto (FLP)" />
                    <DeliverableSwitch name="exclusiveLicense" label="Licencia Exclusiva" />
                    <DeliverableSwitch name="vocalProduction" label="Producción Vocal" />
                    <DeliverableSwitch name="vocalChainPreset" label="Preset Cadena Vocal (Regalo)" />
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
