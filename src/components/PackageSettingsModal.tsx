
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppState, WorkPackageTemplate } from '@/context/AppStateContext';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader } from './ui/card';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PackageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PALETTE = [
  { name: 'Gris', className: 'bg-gray-500 hover:bg-gray-600' },
  { name: 'Rojo', className: 'bg-red-600 hover:bg-red-700' },
  { name: 'Naranja', className: 'bg-orange-500 hover:bg-orange-600' },
  { name: 'Ámbar', className: 'bg-amber-500 hover:bg-amber-600' },
  { name: 'Amarillo', className: 'bg-yellow-500 hover:bg-yellow-600' },
  { name: 'Lima', className: 'bg-lime-500 hover:bg-lime-600' },
  { name: 'Verde', className: 'bg-green-600 hover:bg-green-700' },
  { name: 'Esmeralda', className: 'bg-emerald-600 hover:bg-emerald-700' },
  { name: 'Teal', className: 'bg-teal-600 hover:bg-teal-700' },
  { name: 'Cian', className: 'bg-cyan-600 hover:bg-cyan-700' },
  { name: 'Celeste', className: 'bg-sky-600 hover:bg-sky-700' },
  { name: 'Azul', className: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'Índigo', className: 'bg-indigo-600 hover:bg-indigo-700' },
  { name: 'Violeta', className: 'bg-violet-600 hover:bg-violet-700' },
  { name: 'Púrpura', className: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'Fucsia', className: 'bg-fuchsia-600 hover:bg-fuchsia-700' },
  { name: 'Rosa', className: 'bg-pink-600 hover:bg-pink-700' },
];

const defaultTemplateValues: Omit<WorkPackageTemplate, 'id' | 'name'> = {
  price: 0,
  revisions: 0,
  songLength: 0,
  numberOfInstruments: 0,
  separateFiles: false,
  masterAudio: false,
  projectFileDelivery: false,
  exclusiveLicense: false,
  vocalProduction: false,
  vocalChainPreset: false,
  colorClassName: COLOR_PALETTE[0].className,
};

const PackageSettingsModal: React.FC<PackageSettingsModalProps> = ({ isOpen, onClose }) => {
  const { appState, setAppState } = useAppState();
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const { control, handleSubmit, register, reset, watch } = useForm<{ templates: WorkPackageTemplate[] }>({
    defaultValues: { templates: appState.workPackageTemplates }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "templates"
  });

  // Sync state from context to form
  useEffect(() => {
    reset({ templates: appState.workPackageTemplates });
  }, [appState.workPackageTemplates, reset]);

  const onSave = (data: { templates: WorkPackageTemplate[] }) => {
    setAppState({ workPackageTemplates: data.templates });
    onClose();
  };

  const handleAddNew = () => {
    const newTemplate: WorkPackageTemplate = {
      id: uuidv4(),
      name: `Nuevo Paquete ${fields.length + 1}`,
      ...defaultTemplateValues,
    };
    append(newTemplate);
    setEditingTemplateId(newTemplate.id);
  };
  
  const handleRemove = (index: number) => {
    remove(index);
    if(fields[index]?.id === editingTemplateId) {
        setEditingTemplateId(null);
    }
  };
  
  const handleEdit = (template: WorkPackageTemplate) => {
     setEditingTemplateId(template.id);
  }

  const DeliverableSwitch = ({ index, name, label }: { index: number, name: keyof WorkPackageTemplate, label: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background/30">
      <Label htmlFor={`templates.${index}.${name}`}>{label}</Label>
      <Controller
        name={`templates.${index}.${name}` as any}
        control={control}
        render={({ field }) => (
          <Switch
            id={`templates.${index}.${name}`}
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </div>
  );

  const editingTemplateIndex = fields.findIndex(f => f.id === editingTemplateId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configurar Paquetes de Trabajo</DialogTitle>
          <DialogDescription>Crea, edita y elimina las plantillas para tus órdenes de trabajo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col h-full">
            <div className="grid md:grid-cols-3 gap-6 flex-grow min-h-0">
                {/* Columna de lista de plantillas */}
                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader>
                        <Button type="button" onClick={handleAddNew} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Añadir Plantilla
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-2">
                                {fields.map((template, index) => (
                                    <div 
                                        key={template.id} 
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer",
                                            editingTemplateId === template.id ? "bg-primary/20 border-primary" : "bg-muted/50 hover:bg-muted"
                                        )}
                                        onClick={() => handleEdit(template)}
                                    >
                                        <span>{watch(`templates.${index}.name`)}</span>
                                        <div className='flex items-center'>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(template); }}><Edit className="h-4 w-4" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleRemove(index); }}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                
                {/* Columna de edición */}
                <Card className="md:col-span-2 flex flex-col">
                    <ScrollArea className="h-full">
                        <CardContent className="p-6">
                            {editingTemplateIndex !== -1 ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor={`templates.${editingTemplateIndex}.name`}>Nombre del Paquete</Label>
                                        <Input id={`templates.${editingTemplateIndex}.name`} {...register(`templates.${editingTemplateIndex}.name`)} />
                                    </div>

                                    <div>
                                      <Label>Color del Paquete</Label>
                                      <Controller
                                        name={`templates.${editingTemplateIndex}.colorClassName`}
                                        control={control}
                                        render={({ field }) => (
                                          <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {COLOR_PALETTE.map(color => (
                                                <SelectItem key={color.className} value={color.className}>
                                                  <div className="flex items-center gap-2">
                                                    <div className={cn("h-4 w-4 rounded-full", color.className.split(' ')[0])}></div>
                                                    {color.name}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      />
                                    </div>
                                    
                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`templates.${editingTemplateIndex}.price`}>Precio (USD)</Label>
                                            <Input id={`templates.${editingTemplateIndex}.price`} type="number" {...register(`templates.${editingTemplateIndex}.price`, { valueAsNumber: true })} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`templates.${editingTemplateIndex}.revisions`}>Revisiones</Label>
                                            <Input id={`templates.${editingTemplateIndex}.revisions`} type="number" {...register(`templates.${editingTemplateIndex}.revisions`, { valueAsNumber: true })} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`templates.${editingTemplateIndex}.songLength`}>Duración (seg)</Label>
                                            <Input id={`templates.${editingTemplateIndex}.songLength`} type="number" {...register(`templates.${editingTemplateIndex}.songLength`, { valueAsNumber: true })} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`templates.${editingTemplateIndex}.numberOfInstruments`}># Instrumentos</Label>
                                            <Input id={`templates.${editingTemplateIndex}.numberOfInstruments`} type="number" {...register(`templates.${editingTemplateIndex}.numberOfInstruments`, { valueAsNumber: true })} />
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    <h3 className="text-lg font-semibold">Entregables</h3>

                                    <DeliverableSwitch index={editingTemplateIndex} name="masterAudio" label="Audio Masterizado" />
                                    <DeliverableSwitch index={editingTemplateIndex} name="separateFiles" label="Archivos Separados (STEMS)" />
                                    <DeliverableSwitch index={editingTemplateIndex} name="projectFileDelivery" label="Archivo de Proyecto (FLP)" />
                                    <DeliverableSwitch index={editingTemplateIndex} name="exclusiveLicense" label="Licencia Exclusiva" />
                                    <DeliverableSwitch index={editingTemplateIndex} name="vocalProduction" label="Producción Vocal" />
                                    <DeliverableSwitch index={editingTemplateIndex} name="vocalChainPreset" label="Preset Cadena Vocal (Regalo)" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Selecciona una plantilla para editar o añade una nueva.</p>
                                </div>
                            )}
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
            <DialogFooter className="pt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PackageSettingsModal;
