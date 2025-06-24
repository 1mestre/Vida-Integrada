
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState, WorkItem, WorkPackageTemplate } from '@/context/AppStateContext';
import { MessageSquare, Clipboard, TrendingUp, Trash2, Wrench, Link, Music, Settings, PlusCircle, CalendarIcon, FolderPlus } from 'lucide-react';
import WorkItemModal from '@/components/WorkItemModal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInCalendarDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSound } from '@/context/SoundContext';
import PackageSettingsModal from '@/components/PackageSettingsModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


// Pega esta función completa para reemplazar la versión anterior.
const generateClientMessage = (item: WorkItem, packageTemplates: WorkPackageTemplate[]): string => {
    const isMultiple = item.remakeType.includes('Multiple');
    let message = `Heyyy ${item.clientName}! 👋👋\n\n`;

    // === Bloque 1: Saludo y Descripción (Basado en el tono del paquete) ===
    if (item.packageName === 'Masterpiece') {
        message += isMultiple ? `Yoooo, your ${item.genre} masterpiece remaked beats are officially done and they're straight fire fr!! 🔥🔥✨ Hahaha, we went CRAZY on these!!\n\n` : `Yooo, your ${item.genre} masterpiece is officially done and it's straighttt fire fr!! 🔥✨\n\n`;
        message += isMultiple ? "🎛️🎛️ These remakes are CLEANNN as hell and ready to make some NOISEEE!! Each one hits different!! 🚀🚀\n\n" : "🎛️🎛️ This remake got the FULL treatment - custom-built and clean as hell!! Readyyy for the big leagues!! 🏆🏆\n\n";
    } else if (item.packageName === 'Exclusive') {
        message += isMultiple ? `Your ${item.genre} remaked beats are readyyy to drop!! 💣💣 No cap, these ones hit DIFFERENT!! 💯🎵\n\n` : `Your ${item.genre} beat is readyyy to drop!! No cap, this one hits different 💯🎵\n\n`;
        message += isMultiple ? "🎛️ All these remakes are LOCKED IN!! 🔒 Multiple vibes, same CRAZY energy!! 💪💪 Hahaha let's gooo!\n\n" : "🎛️ The remake is LOCKED and loaded!! 🔫 Custom-made just for you, readyyy for your vocals!! 🎤✨\n\n";
    } else { // Amateurs
        message += isMultiple ? `So hereee are those ${item.genre} demos you wanted!! 🎉 Just some quick vibes, nothing too wild yet hehe 😎🎧\n\n` : `So here's that ${item.genre} demo you wanted!! Just a quick vibe check, nothing too wild yet 😎🎧\n\n`;
        message += isMultiple ? "🎛️ These are just demo ideas for the remakes - the foundation's there, just needs the FULLLL glow-up!! 🏗️🏗️\n\n" : "🎛️ This is just the demo version of the remake - think of it as the rough draft with MADDD potential!! 🎨\n\n";
    }

    // === Bloque 2: Entregables (100% dinámico - Lo que el cliente YA TIENE) ===
    const deliverables: string[] = [];
    if (item.masterAudio) deliverables.push("- Full WAV: Mixed, mastered, and READYYY to upload!! 🎯");
    if (item.separateFiles) deliverables.push("- Full WAV + STEMS: The WHOLE package, no bs!! 💎");
    if (item.projectFileDelivery) deliverables.push("- FLP Project File: Full creative control in your hands!! 🎚️🎚️");
    if (item.exclusiveLicense) deliverables.push("- Exclusive Rights Contract: 100% ownership, no sharing needed!! 📋");
    if (item.vocalProduction) deliverables.push("- Vocal Production Add-on: Pro-level vocal mixing & tuning to make your voice SHINE!! ✨🎙️");
    
    if (deliverables.length > 0) {
        message += "📎📎 WHAT YOU'RE GETTING:\n" + deliverables.join('\n') + '\n\n';
    }

    if (item.vocalChainPreset) {
        message += `🎁 EXCLUSIVE GIFT: Custom vocal chain preset made for ${isMultiple ? `these ${item.genre} vibes` : `this ${item.genre} vibe`} 🎙️🎙️\n(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝🤝\n\n`;
    }

    // === Bloque 3: Oferta de "Upsell" (Inteligente, Diferencial y a Prueba de Fallos) ===
    const sortedPkgs = [...packageTemplates].sort((a, b) => a.price - b.price);
    const currentPackageTemplate = sortedPkgs.find(p => p.name === item.packageName);
    const highestPackageTemplate = sortedPkgs[sortedPkgs.length - 1];

    // Solo mostrar la oferta si el cliente NO tiene el paquete más alto
    if (currentPackageTemplate && highestPackageTemplate && currentPackageTemplate.id !== highestPackageTemplate.id) {
        // Identificar cuál es el siguiente nivel de paquete
        const currentIndex = sortedPkgs.findIndex(p => p.id === currentPackageTemplate.id);
        const nextPackageTemplate = sortedPkgs[currentIndex + 1];

        if (nextPackageTemplate) {
            let upsellText = `🤔 BUT WAIT - If you're feeling this and want the full experience, just pay the difference:\n`;
            const priceDiff = nextPackageTemplate.price - currentPackageTemplate.price;

            if (priceDiff > 0) {
                upsellText += `• ${currentPackageTemplate.name} ($${currentPackageTemplate.price}) → ${nextPackageTemplate.name} ($${nextPackageTemplate.price}): +$${priceDiff}\n\n`;
            }

            // Calcular los beneficios diferenciales
            const differentialFeatures: string[] = [];
            if (nextPackageTemplate.masterAudio && !item.masterAudio) differentialFeatures.push("• Professional mixing/mastering 🎛️🎚️");
            if (nextPackageTemplate.separateFiles && !item.separateFiles) differentialFeatures.push("• Full STEMS 💎");
            if (nextPackageTemplate.projectFileDelivery && !item.projectFileDelivery) differentialFeatures.push("• FLP Project File 🎚️🎚️");
            if (nextPackageTemplate.exclusiveLicense && !item.exclusiveLicense) differentialFeatures.push("• Exclusive license (100% yours) 📜");
            if (nextPackageTemplate.vocalProduction && !item.vocalProduction) differentialFeatures.push("• Vocal Production ✨🎙️");
            
            // Solo mostrar la sección "And get:" si hay beneficios reales que ofrecer
            if (differentialFeatures.length > 0) {
                upsellText += "And get:\n" + differentialFeatures.join('\n') + "\n\n";
            }

            message += upsellText + "Just holla at me if you wanna upgrade! 🚀🚀\n\n";
        }
    }
    
    // === Bloque 4: Secciones Finales (CON LÓGICA DE REVISIONES CORREGIDA) ===
    message += `${isMultiple ? 'Keys' : 'Key'}: ${item.key} | ${isMultiple ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
    message += `📦📦 Order #${item.orderNumber}\n\n`;
    
    if (item.packageName === 'Masterpiece') {
        message += `✅✅ This is built for the BIGGG stages - Spotify, radio, wherever you wanna take it!! 🌟🌟\n${item.revisionsRemaining} revisions remaining 🔧🔧\n\n🎁 PRO TIP: Drop a 5-star review and I'll hook you UPPP with $10 off your next order!! Helps me out FOR REALLL 🙏🙏\n\nNow go make some MAGIC happen!! ✨🎤`;
    } else if (item.packageName === 'Exclusive') {
        message += `✅ ${item.revisionsRemaining} revisions remaining 🔧\n${isMultiple ? "Time to make these BEATS slap!! 💥💥" : "Time to make some WAVES!! 🌊🌊"}\n\n🎁 PRO TIP: Leave me a 5-star review and I'll give you $10 off your next beat!! WIN-WIN SITUATION 😉💰💰\n\nLet's get this music out there!!! 🚀🚀`;
    } else { // Amateurs
        message += "✅ Let me know what you think of the direction!! If you're vibing with it, we can ALWAYSSS take it to the next level!! 🎯🎯\n\n";
        // Lógica dinámica para las revisiones en el paquete Amateurs
        if (item.revisionsRemaining > 0) {
            message += `(${item.revisionsRemaining} custom revision(s) included in this deal! 😉💡💡)`;
        } else {
            message += "(No revisions on demos, but that's what upgrades are for!! 😉💡💡)";
        }
    }

    return message;
};


const FileNameToolsPopover = ({ item, toast, playSound }: { item: WorkItem; toast: (options: any) => void; playSound: (soundName: string) => void; }) => {
    const [copySuccess, setCopySuccess] = React.useState('');
    const filenames = generateFileNames(item);

    const labels: { [key: string]: string } = {
        stems: 'STEMS',
        wav: 'WAV',
        project: 'FLP'
    };

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(type);
            toast({ title: "¡Copiado!", description: `Nombre de archivo para ${labels[type]} copiado.` });
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('No se pudo copiar el texto: ', err);
            toast({ variant: "destructive", title: "Error", description: "No se pudo copiar el nombre del archivo." });
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Herramientas de Proyecto</h4>
                        <p className="text-sm text-muted-foreground">
                           Automatiza tareas de creación y nombrado de archivos.
                        </p>
                    </div>
                    <div className="grid gap-3">
                        {Object.entries(filenames).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{labels[key] || key.toUpperCase()}</span>
                                <Button
                                    size="sm"
                                    onClick={() => handleCopy(value, key)}
                                    className="w-24"
                                >
                                    {copySuccess === key ? '¡Copiado!' : 'Copiar'}
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                        onClick={async () => {
                            try {
                              const params = new URLSearchParams({
                                clientName: item.clientName,
                                genre: item.genre,
                                bpm: item.bpm,
                                key: item.key,
                              });
                              await fetch(`http://localhost:12345/create-project?${params.toString()}`);
                              playSound('genericClick');
                              toast({
                                title: "Proyecto Creado",
                                description: "La automatización para crear el proyecto ha sido iniciada.",
                              });
                            } catch (error) {
                              toast({
                                variant: "destructive",
                                title: "Error de Conexión",
                                description: "No se pudo conectar con el agente local.",
                              });
                            }
                        }}
                    >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Crear Proyecto FLP
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const generateFileNames = (item: WorkItem) => {
    const packageNameUC = item.packageName.toUpperCase();

    return {
        stems: `✩Separate Audio Tracks (STEMS) ${packageNameUC} ${item.key} ${item.bpm} BPM - ${item.clientName}✩`,
        wav: `♬WAV FILE • ${item.genre} • ${packageNameUC} • ${item.key} • ${item.bpm} BPM - ${item.clientName}♬`,
        project: `♪FLP PROJECT • ${item.genre}• ${packageNameUC} • ${item.key}• ${item.bpm} BPM - ${item.clientName} ♪`
    };
};

const statusColorMap: Record<WorkItem['deliveryStatus'], string> = {
  'Pending': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'In Transit': 'bg-blue-500 hover:bg-blue-600 text-white',
  'Delivered': 'bg-green-600 hover:bg-green-700 text-white',
  'In Revision': 'bg-purple-500 hover:bg-purple-600 text-white',
  'Returned': 'bg-red-600 hover:bg-red-700 text-white'
};

const revisionColorMap: { [key: number]: string } = {
  4: 'text-green-400 font-bold',
  3: 'text-lime-400',
  2: 'text-yellow-400',
  1: 'text-orange-400',
  0: 'text-gray-500',
};

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


// Componente especializado para la celda de fecha editable
const EditableDateCell = ({
  row: { original: item },
  updateDate,
}: {
  row: any;
  updateDate: (itemId: string, newDate: Date) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(item.deliveryDate + 'T00:00:00');
  const today = startOfDay(new Date());
  const daysDiff = differenceInCalendarDays(date, today);

  let colorClass = 'text-muted-foreground';
  if (daysDiff <= 1) colorClass = 'text-red-500 font-bold';
  else if (daysDiff <= 3) colorClass = 'text-yellow-500 font-semibold';
  else if (daysDiff >= 4) colorClass = 'text-green-600';

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      updateDate(item.id, newDate);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onDoubleClick={() => setIsOpen(true)}
          className={cn('text-center font-medium cursor-pointer p-2 rounded-md hover:bg-muted', colorClass)}
        >
          {format(date, "d 'de' MMMM, yyyy", { locale: es })}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          disabled={(date) => date < startOfDay(new Date())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};


const WorkTab = () => {
    const { appState, setAppState } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const { toast } = useToast();
    const { playSound } = useSound();

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [rateLoading, setRateLoading] = useState(true);
    const [amount, setAmount] = useState('');
  
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

    useEffect(() => {
        fetch('https://open.er-api.com/v6/latest/USD')
          .then(res => res.json())
          .then(data => {
            setExchangeRate(data.rates.COP);
            setRateLoading(false);
          })
          .catch(() => {
            setExchangeRate(4000); // Fallback
            setRateLoading(false);
          });
    }, []);

    const sortedWorkItems = useMemo(() => {
        return [...appState.workItems].sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    }, [appState.workItems]);

    
    const handleDeleteWorkItem = (itemToDelete: WorkItem) => {
        playSound('deleteItem');
        setAppState({
            workItems: appState.workItems.filter(item => item.id !== itemToDelete.id),
            tasks: appState.tasks.filter(task => task.workItemId !== itemToDelete.id),
            calendarEventsData: appState.calendarEventsData.filter(event => event.id !== `event-${itemToDelete.id}`)
        });
    };
    
    const handleOpenNewOrderModal = () => {
        playSound('genericClick');
        setSelectedItem(null);
        setIsModalOpen(true);
    };
    
    const handleOpenPackageSettingsModal = () => {
        playSound('genericClick');
        setIsSettingsModalOpen(true);
    };

    const handleAddIncome = () => {
        if (!amount || !exchangeRate) return;

        playSound('pomodoroStart');
        
        const numericAmount = parseFloat(amount);
        let newContribution;

        if (appState.selectedInputCurrencyIngresos === 'USD') {
            const fee = 3;
            const percentageFee = 0.03;
            if (numericAmount <= fee) return;
            const netUSD = (numericAmount - fee) * (1 - percentageFee);
            const netCOP = netUSD * exchangeRate;
            newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSDValue: netUSD, netCOPValue: netCOP };
        } else {
            const netCOP = numericAmount;
            const netUSD = netCOP / exchangeRate;
            newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSDValue: netUSD, netCOPValue: netCOP };
        }
        
        setAppState({ contributions: [newContribution, ...appState.contributions] });
        setAmount('');
    };

    const handleDeleteIncome = (id: string) => {
        playSound('deleteItem');
        const updatedContributions = appState.contributions.filter(c => c.id !== id);
        setAppState({ contributions: updatedContributions });
    };

    const handleStatusUpdate = useCallback((itemId: string, newStatus: WorkItem['deliveryStatus']) => {
      setAppState(prevState => {
        const statusToColumnMap: Record<WorkItem['deliveryStatus'], 'todo' | 'inprogress' | 'done'> = {
          'Pending': 'todo',
          'In Transit': 'inprogress',
          'In Revision': 'inprogress',
          'Delivered': 'done',
          'Returned': 'done',
        };

        const updatedWorkItems = prevState.workItems.map(item =>
          item.id === itemId ? { ...item, deliveryStatus: newStatus } : item
        );

        const updatedTasks = prevState.tasks.map(task =>
          task.workItemId === itemId ? { ...task, column: statusToColumnMap[newStatus] } : task
        );

        return { ...prevState, workItems: updatedWorkItems, tasks: updatedTasks };
      });
    }, [setAppState]);

    const handleRevisionsUpdate = (itemId: string, newRevisions: number) => {
        setAppState(prevState => ({
          ...prevState,
          workItems: prevState.workItems.map(item =>
            item.id === itemId ? { ...item, revisionsRemaining: newRevisions } : item
          ),
        }));
      };

    const handleDateUpdate = useCallback((itemId: string, newDate: Date) => {
        const formattedDate = format(newDate, 'yyyy-MM-dd');
  
        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item =>
                item.id === itemId ? { ...item, deliveryDate: formattedDate } : item
            );
    
            const updatedEvents = prevState.calendarEventsData.map(event =>
                event.workItemId === itemId ? { ...event, start: formattedDate } : event
            );
            
            return { ...prevState, workItems: updatedWorkItems, calendarEventsData: updatedEvents };
        });
    }, [setAppState]);
    
    const handlePackageUpdate = useCallback((itemId: string, newPackageName: string) => {
        const template = appState.workPackageTemplates.find(t => t.name === newPackageName);
        if (!template) return;

        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        packageName: template.name,
                        price: template.price,
                        revisionsRemaining: template.revisions,
                        songLength: template.songLength,
                        numberOfInstruments: template.numberOfInstruments,
                        quantity: template.quantity || 1,
                        separateFiles: template.separateFiles,
                        masterAudio: template.masterAudio,
                        projectFileDelivery: template.projectFileDelivery,
                        exclusiveLicense: template.exclusiveLicense,
                        vocalProduction: template.vocalProduction,
                        vocalChainPreset: template.vocalChainPreset,
                    };
                }
                return item;
            });
            return { ...prevState, workItems: updatedWorkItems };
        });
    }, [appState.workPackageTemplates, setAppState]);

    const financialSummary = useMemo(() => {
        const incomeThisMonth = appState.contributions
          .filter(c => c.date.startsWith(currentMonthKey))
          .reduce((sum, c) => sum + c.netCOPValue, 0);
        
        const totalNetCOP = appState.contributions.reduce((sum, c) => sum + c.netCOPValue, 0);
        const totalNetUSD = appState.contributions.reduce((sum, c) => sum + c.netUSDValue, 0);
        
        const progress = currentMonthTarget > 0 ? (incomeThisMonth / currentMonthTarget) * 100 : 0;
        
        return { totalNetCOP, totalNetUSD, incomeThisMonth, progress };
    }, [appState.contributions, currentMonthTarget, currentMonthKey]);

    const monthTimeProgress = useMemo(() => {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return (today.getDate() / endOfMonth.getDate()) * 100;
    }, []);


    const columns: ColumnDef<WorkItem>[] = useMemo(() => [
        {
          id: 'message',
          header: () => <div className="text-center">Mensaje</div>,
          cell: ({ row }) => {
            const item = row.original;
            const generatedMessage = generateClientMessage(item, appState.workPackageTemplates);
        
            return (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mensaje Personalizado para {item.clientName}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Este es el mensaje generado basado en los detalles actuales de la orden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto p-4 bg-muted rounded-md">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {generatedMessage}
                    </pre>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cerrar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        navigator.clipboard.writeText(generatedMessage);
                        toast({ title: "Copiado", description: "Mensaje copiado al portapapeles." });
                      }}>
                      Copiar Mensaje
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          },
        },
        {
          id: 'tools',
          header: () => <div className="text-center">Tools</div>,
          cell: ({ row }) => {
            const item = row.original;
            return <div className="text-center"><FileNameToolsPopover item={item} toast={toast} playSound={playSound} /></div>;
          },
        },
        { 
            accessorKey: 'clientName', 
            header: () => <div className="text-center">Cliente</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('clientName')}</div>
        },
        {
            accessorKey: 'deliveryDate',
            header: () => <div className="text-center">Entrega</div>,
            cell: (props) => <EditableDateCell {...props} updateDate={handleDateUpdate} />,
        },
        {
          accessorKey: 'key',
          header: () => <div className="text-center">Key</div>,
          cell: ({ row }) => {
            const keyText = row.getValue('key') as string;
            const parts = keyText.split(' / ');
            return (
              <div className="text-center">
                <span className="font-semibold text-orange-500">{parts[0]}</span>
                {parts[1] && (
                  <>
                    <span className="text-muted-foreground"> / </span>
                    <span className="font-semibold text-sky-700">{parts[1]}</span>
                  </>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: 'bpm',
          header: () => <div className="text-center">BPM</div>,
          cell: ({ row }) => <div className="text-center">{row.getValue('bpm')}</div>
        },
        { 
            accessorKey: 'deliveryStatus', 
            header: () => <div className="text-center">Estado</div>,
            cell: ({ row }) => {
                const item = row.original;
                const statusOptions: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];
          
                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto">
                                <Badge className={cn("cursor-pointer", statusColorMap[item.deliveryStatus])}>
                                {item.deliveryStatus}
                                </Badge>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            {statusOptions.map(status => (
                                <DropdownMenuItem
                                key={status}
                                onSelect={() => handleStatusUpdate(item.id, status)}
                                >
                                <span className={cn('h-2 w-2 rounded-full mr-2', statusColorMap[status])} />
                                <span>{status}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        },
        {
            accessorKey: 'revisionsRemaining',
            header: () => <div className="text-center">Revisiones</div>,
            cell: ({ row }) => {
              const item = row.original;
              const revisionOptions = [4, 3, 2, 1, 0];
          
              return (
                <div className="text-center">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn("font-semibold", revisionColorMap[item.revisionsRemaining])}>
                        {item.revisionsRemaining}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {revisionOptions.map(revs => (
                        <DropdownMenuItem key={revs} onSelect={() => handleRevisionsUpdate(item.id, revs)}>
                            <span className={cn('font-semibold', revisionColorMap[revs])}>{revs}</span>
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              );
            },
        },
        { 
            accessorKey: 'packageName', 
            header: () => <div className="text-center">Paquete</div>,
            cell: ({ row }) => {
                const item = row.original;
                const currentPackage = appState.workPackageTemplates.find(p => p.name === item.packageName);
                const colorClass = currentPackage ? currentPackage.colorClassName : 'bg-gray-500';

                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto">
                                <Badge className={cn("cursor-pointer", colorClass)}>
                                {item.packageName}
                                </Badge>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            {appState.workPackageTemplates.map(pkg => (
                                <DropdownMenuItem
                                key={pkg.id}
                                onSelect={() => handlePackageUpdate(item.id, pkg.name)}
                                >
                                <span className={cn('h-2 w-2 rounded-full mr-2', pkg.colorClassName)} />
                                <span>{pkg.name}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        },
        {
            accessorKey: 'price',
            header: () => <div className="text-center">Precio</div>,
            cell: ({row}) => <div className="text-center">{formatUSD(row.original.price)}</div>
        },
        { 
            accessorKey: 'orderNumber', 
            header: () => <div className="text-center">Orden #</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('orderNumber')}</div>
        },
        { 
            accessorKey: 'genre', 
            header: () => <div className="text-center">Género</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('genre')}</div>
        },
        {
            id: 'edit',
            header: () => <div className="text-center">Acciones</div>,
            cell: ({ row }) => (
              <div className="flex gap-1 justify-center">
                <Button variant="outline" size="sm" onClick={() => {
                    setSelectedItem(row.original);
                    setIsModalOpen(true);
                }}>
                    Editar
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteWorkItem(row.original)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
        },
    ], [appState.workItems, appState.workPackageTemplates, handleDateUpdate, handleStatusUpdate, handlePackageUpdate, handleRevisionsUpdate, toast, playSound]);

    const table = useReactTable({
        data: sortedWorkItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold tracking-tight">FIVERR📀</h1>
                <div className="flex items-center gap-2 mt-2">
                  <a href="https://www.fiverr.com/seller_dashboard" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                      <Link className="mr-2 h-4 w-4" />
                      Fiverr
                    </Button>
                  </a>
                  <a href="https://tunebat.com/Analyzer" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Music className="mr-2 h-4 w-4" />
                      Tunebat
                    </Button>
                  </a>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                    onClick={async () => {
                      try {
                        await fetch('http://localhost:12345/open-template');
                        playSound('genericClick');
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Error de Conexión",
                          description: "No se pudo conectar con el agente local. Asegúrate de que esté en ejecución.",
                        });
                      }
                    }}
                  >
                    FL TEMPLATE🥭
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <Button variant="outline" onClick={handleOpenPackageSettingsModal}>
                   <Settings className="mr-2 h-4 w-4" />
                   Set Packages
                 </Button>
                 <Button onClick={handleOpenNewOrderModal} className="h-14 text-lg">
                   Nueva Orden🤑💵
                 </Button>
               </div>
            </div>

            <Card className="glassmorphism-card">
                <CardContent className="pt-6">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-center">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No hay datos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <Card className="glassmorphism-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 text-primary" />
                      Meta de Ingresos - {format(new Date(), 'MMMM yyyy', { locale: es })}
                    </CardTitle>
                    <CardDescription>Establece y sigue tu objetivo de ingresos mensuales.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="Meta en COP"
                        value={currentMonthTarget || ''}
                        onChange={(e) => setAppState({ monthlyTargets: { ...appState.monthlyTargets, [currentMonthKey]: Number(e.target.value) } })}
                        className="bg-background/50 border-border"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Progreso: {formatCOP(financialSummary.incomeThisMonth)} / {formatCOP(currentMonthTarget)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Progreso Meta del Mes ({financialSummary.progress.toFixed(1)}%)</p>
                        <Progress value={financialSummary.progress} className="h-4 shimmer [&>div]:bg-ios-green"/>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Progreso del Mes (Tiempo: {monthTimeProgress.toFixed(1)}%)</p>
                        <Progress value={monthTimeProgress} className="h-4 [&>div]:bg-ios-orange"/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select value={appState.selectedInputCurrencyIngresos} onValueChange={(val: 'USD' | 'COP') => setAppState({ selectedInputCurrencyIngresos: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="COP">COP</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={`Monto en ${appState.selectedInputCurrencyIngresos}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="sm:col-span-2 bg-background/50 border-border"
                      />
                    </div>
                    <Button onClick={handleAddIncome} disabled={rateLoading || !amount} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {rateLoading ? 'Cargando tasa...' : 'Añadir Ingreso'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Tasa de cambio actual (USD a COP): {rateLoading ? '...' : exchangeRate?.toFixed(2)}</p>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Historial de Ingresos</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                                <ul className="space-y-3 pr-4">
                                    {appState.contributions.map(c => (
                                        <li key={c.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                                            <div>
                                                <div className="font-medium text-ios-green">{formatCOP(c.netCOPValue)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(c.date), 'dd MMM yyyy', { locale: es })} - {formatUSD(c.netUSDValue)}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => handleDeleteIncome(c.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Progreso Metas Mensuales</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                               <ul className="space-y-3 pr-4">
                                    {Object.entries(appState.monthlyTargets).reverse().map(([key, target]) => {
                                        const monthIncome = appState.contributions
                                            .filter(c => c.date.startsWith(key))
                                            .reduce((sum, c) => sum + c.netCOPValue, 0);
                                        const achieved = monthIncome >= target;
                                        return (
                                            <li key={key} className="text-sm border-b border-border/50 pb-2">
                                                <p className="font-medium">{format(new Date(`${key}-02`), 'MMMM yyyy', { locale: es })}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">{formatCOP(monthIncome)} / {formatCOP(target)}</span>
                                                    <span className={`font-bold ${achieved ? 'text-ios-green' : 'text-ios-orange'}`}>
                                                        {achieved ? 'Logrado' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
              </div>
              <div className="space-y-6">
                 <Card className="w-full max-w-md glassmorphism-card">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Ingresos Este Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-baseline gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold tracking-tighter text-yellow-500">{formatCOP(financialSummary.incomeThisMonth)}</p>
                                <p className="text-xs font-medium text-yellow-500">(COP)</p>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">/</div>
                            <div className="text-center">
                                <p className="text-2xl font-bold tracking-tighter text-green-500">{formatUSD(financialSummary.incomeThisMonth / (exchangeRate || 4000))}</p>
                                <p className="text-xs font-medium text-green-500">(USD)</p>
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingresos Acumulados: {formatCOP(financialSummary.totalNetCOP)} / {formatUSD(financialSummary.totalNetUSD)}
                    </p>
                  </div>
                {financialSummary.progress >= 100 && (
                    <Card className="glassmorphism-card bg-ios-green/20 border-ios-green p-4 text-center">
                        <p className="font-bold text-ios-green animate-pulse">🎉✨ ¡FELICITACIONES! ¡META ALCANZADA! ✨🎉</p>
                    </Card>
                )}
              </div>
            </div>

            <WorkItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />

            <PackageSettingsModal 
              isOpen={isSettingsModalOpen}
              onClose={() => setIsSettingsModalOpen(false)}
            />
        </div>
    );
};

export default WorkTab;

    