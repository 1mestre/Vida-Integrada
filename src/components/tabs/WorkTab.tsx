
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
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState, WorkItem } from '@/context/AppStateContext';
import { MessageSquare, Clipboard, TrendingUp, Trash2, Wrench, Link, Music, Settings, PlusCircle, CalendarIcon, Flame } from 'lucide-react';
import WorkItemModal from '@/components/WorkItemModal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSound } from '@/context/SoundContext';
import PackageSettingsModal from '@/components/PackageSettingsModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const generateFileNames = (item: WorkItem) => {
    const packageNameUC = item.packageName.toUpperCase();

    return {
        stems: `✩Separate Audio Tracks (STEMS) ${packageNameUC} ${item.key} ${item.bpm} BPM - ${item.clientName}✩`,
        wav: `♬WAV FILE • ${item.genre} • ${packageNameUC} • ${item.key} • ${item.bpm} BPM - ${item.clientName}♬`,
        project: `♪FLP PROJECT • ${item.genre}• ${packageNameUC} • ${item.key}• ${item.bpm} BPM - ${item.clientName} ♪`
    };
};

const FileNameToolsPopover = ({ item }: { item: WorkItem }) => {
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
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('No se pudo copiar el texto: ', err);
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
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Nombres de Archivo</h4>
                        <p className="text-sm text-muted-foreground">
                            Copia el nombre estandarizado para cada tipo de archivo.
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
                </div>
            </PopoverContent>
        </Popover>
    );
};


const generateClientMessage = (item: WorkItem): string => {
  const isMultiple = item.remakeType.includes('Multiple');
  const quantity = item.quantity || 1;
  let message = `Heyyy ${item.clientName}! 👋👋\n\n`;

  // --- Bloque 1: Saludo Inicial basado en el paquete ---
  if (item.packageName === 'Masterpiece') {
    message += isMultiple 
      ? `Yoooo, your ${quantity} ${item.genre} masterpiece remaked beats are officially done and they're straight fire fr!! 🔥🔥✨ Hahaha, we went CRAZY on these!!\n\n`
      : `Yooo, your ${item.genre} masterpiece is officially done and it's straighttt fire fr!! 🔥✨\n\n`;
  } else if (item.packageName === 'Exclusive') {
    message += isMultiple
      ? `Your ${quantity} ${item.genre} remaked beats are readyyy to drop!! 💣💣 No cap, these ones hit DIFFERENT!! 💯🎵\n\n`
      : `Your ${item.genre} beat is readyyy to drop!! No cap, this one hits different 💯🎵\n\n`;
  } else { // Amateurs
    message += isMultiple
      ? `So hereee are those ${quantity} ${item.genre} demos you wanted!! 🎉 Just some quick vibes, nothing too wild yet hehe 😎🎧\n\n`
      : `So here's that ${item.genre} demo you wanted!! Just a quick vibe check, nothing too wild yet 😎🎧\n\n`;
  }

  // --- Bloque 2: Detalles del Remake ---
  if (item.remakeType.includes('Remake')) {
    if (item.packageName === 'Masterpiece') {
      message += isMultiple ? "🎛️🎛️ These remakes are CLEANNN as hell and ready to make some NOISEEE!! Each one hits different!! 🚀🚀\n\n" : "🎛️🎛️ This remake got the FULL treatment - custom-built and clean as hell!! Readyyy for the big leagues!! 🏆🏆\n\n";
    } else if (item.packageName === 'Exclusive') {
      message += isMultiple ? "🎛️ All these remakes are LOCKED IN!! 🔒 Multiple vibes, same CRAZY energy!! 💪💪 Hahaha let's gooo!\n\n" : "🎛️ The remake is LOCKED and loaded!! 🔫 Custom-made just for you, readyyy for your vocals!! 🎤✨\n\n";
    } else { // Amateurs
      message += isMultiple ? "🎛️ These are just demo ideas for the remakes - the foundation's there, just needs the FULLLL glow-up!! 🏗️🏗️\n\n" : "🎛️ This is just the demo version of the remake - think of it as the rough draft with MADDD potential!! 🎨\n\n";
    }
  }

  // --- Bloque 3: Lista de Entregables (100% Dinámica) ---
  message += "🎁 Entregables\n";
  if (item.masterAudio) message += "- Audio Masterizado\n";
  if (item.separateFiles) message += "- Archivos Separados (STEMS)\n";
  if (item.projectFileDelivery) message += "- Archivo de Proyecto (FLP)\n";
  if (item.exclusiveLicense) message += "- Licencia Exclusiva\n";
  if (item.vocalProduction) message += "- Producción Vocal\n";
  if (item.vocalChainPreset) message += "- Preset Cadena Vocal (Regalo)\n";
  message += "\n";

  // --- Bloque 4: Secciones Finales ---
  message += `${isMultiple ? 'Tonalidades' : 'Tonalidad'}: ${item.key} | ${isMultiple ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
  message += `📦 Orden #${item.orderNumber}\n\n`;
  
  if (item.packageName === 'Masterpiece') {
    message += `✅✅ ¡Construido para los grandes escenarios! (Spotify, radio, etc.) 🌟🌟\n${item.revisionsRemaining} revisiones restantes 🔧🔧\n\n🎁 PRO TIP: ¡Una reseña 5 estrellas te da $10 de descuento en tu próximo pedido! 🙏🙏\n\n¡Ahora a crear magia! ✨🎤`;
  } else if (item.packageName === 'Exclusive') {
    message += `✅ ${item.revisionsRemaining} revisiones restantes 🔧\n`;
    message += isMultiple ? "¡A romperla con estos BEATS! 💥💥\n\n" : "¡A crear olas! 🌊🌊\n\n";
    message += `🎁 PRO TIP: ¡Una reseña 5 estrellas te da $10 de descuento en tu próximo beat! 😉💰💰\n\n¡Vamos a sacar esta música! 🚀🚀`;
  } else { // Amateurs
    message += "✅ ¡Déjame saber qué te parece la dirección! Si te gusta, ¡siempre podemos llevarlo al siguiente nivel! 🎯🎯\n\n(No hay revisiones en los demos, ¡pero para eso son las mejoras! 😉💡💡)";
  }

  return message;
};


const statusColorMap: Record<WorkItem['deliveryStatus'], string> = {
  'Pending': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'In Transit': 'bg-blue-500 hover:bg-blue-600 text-white',
  'Delivered': 'bg-green-600 hover:bg-green-700 text-white',
  'In Revision': 'bg-purple-500 hover:bg-purple-600 text-white',
  'Returned': 'bg-red-600 hover:bg-red-700 text-white'
};

const packageColorMap: Record<string, string> = {
  'Masterpiece': 'bg-purple-600 hover:bg-purple-700',
  'Exclusive': 'bg-sky-600 hover:bg-sky-700',
  'Amateurs': 'bg-teal-600 hover:bg-teal-700',
};

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


const WorkTab = () => {
    const { appState, setAppState } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [messageToShow, setMessageToShow] = useState('');
    const { toast } = useToast();
    const { playSound } = useSound();

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [rateLoading, setRateLoading] = useState(true);
    const [amount, setAmount] = useState('');
  
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

    const keyOptions = [
      { value: 'C / Am', label: 'C Maj / A min' },
      { value: 'G / Em', label: 'G Maj / E min' },
      { value: 'D / Bm', label: 'D Maj / B min' },
      { value: 'A / F#m', label: 'A Maj / F# min' },
      { value: 'E / C#m', label: 'E Maj / C# min' },
      { value: 'B / G#m', label: 'B Maj / G# min' },
      { value: 'F# / D#m', label: 'F# Maj / D# min' },
      { value: 'Db / Bbm', label: 'Db Maj / Bb min' },
      { value: 'Ab / Fm', label: 'Ab Maj / F min' },
      { value: 'Eb / Cm', label: 'Eb Maj / C min' },
      { value: 'Bb / Gm', label: 'Bb Maj / G min' },
      { value: 'F / Dm', label: 'F Maj / D min' }
    ];

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

    const handleCopy = () => {
        navigator.clipboard.writeText(messageToShow).then(() => {
            toast({ title: 'Copiado', description: 'El mensaje se ha copiado al portapapeles.' });
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el mensaje.' });
            console.error('Failed to copy: ', err);
        });
        setIsAlertOpen(false);
    };
    
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
            newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
        } else {
            const netCOP = numericAmount;
            const netUSD = netCOP / exchangeRate;
            newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
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

    const handleKeyUpdate = useCallback((itemId: string, newKey: string) => {
      setAppState(prevState => ({
        ...prevState,
        workItems: prevState.workItems.map(item =>
          item.id === itemId ? { ...item, key: newKey } : item
        ),
      }));
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
        const totalNetCOP = appState.contributions.reduce((sum, c) => sum + c.netCOP, 0);
        const totalNetUSD = appState.contributions.reduce((sum, c) => sum + c.netUSD, 0);
        const incomeThisMonth = appState.contributions
          .filter(c => c.date.startsWith(currentMonthKey))
          .reduce((sum, c) => sum + c.netCOP, 0);
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
            id: 'actions',
            header: 'Mensaje',
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => {
                    setMessageToShow(generateClientMessage(row.original));
                    setIsAlertOpen(true);
                }}>
                    <MessageSquare className="h-4 w-4 text-primary" />
                </Button>
            )
        },
        {
          id: 'tools',
          header: 'Tools',
          cell: ({ row }) => {
            const item = row.original;
            return <FileNameToolsPopover item={item} />;
          },
        },
        { accessorKey: 'clientName', header: 'Cliente' },
        { accessorKey: 'orderNumber', header: 'Orden #' },
        { 
            accessorKey: 'deliveryDate', 
            header: 'Entrega',
            cell: ({ row }) => {
                const item = row.original;
                const date = new Date(item.deliveryDate + 'T00:00:00');
          
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, "d 'de' MMMM, yyyy", { locale: es })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          if (newDate) {
                            handleDateUpdate(item.id, newDate);
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                );
            }
        },
        { accessorKey: 'genre', header: 'Género' },
        {
          accessorKey: 'key',
          header: 'Key',
          cell: ({ row }) => {
            const keyValue = row.getValue('key') as string;
            const keyLabel = keyOptions.find(opt => opt.value === keyValue)?.label || keyValue;
            return <span>{keyLabel}</span>;
          },
        },
        {
          accessorKey: 'bpm',
          header: 'BPM',
        },
        { 
            accessorKey: 'packageName', 
            header: 'Paquete',
            cell: ({ row }) => {
                const item = row.original;
                const packageOptions = appState.workPackageTemplates.map(p => p.name);

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <Badge className={cn("cursor-pointer", packageColorMap[item.packageName])}>
                          {item.packageName}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {packageOptions.map(pkgName => (
                        <DropdownMenuItem
                          key={pkgName}
                          onSelect={() => handlePackageUpdate(item.id, pkgName)}
                        >
                          <span className={cn('h-2 w-2 rounded-full mr-2', packageColorMap[pkgName])} />
                          <span>{pkgName}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
            }
        },
        {
            accessorKey: 'price',
            header: 'Precio',
            cell: ({row}) => formatUSD(row.original.price)
        },
        { 
            accessorKey: 'deliveryStatus', 
            header: 'Estado',
            cell: ({ row }) => {
                const item = row.original;
                const statusOptions: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];
          
                return (
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
                );
            }
        },
        {
            id: 'edit',
            cell: ({ row }) => (
              <div className="flex gap-1">
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
    ], [appState.workItems, appState.workPackageTemplates, handleDateUpdate, handleStatusUpdate, handleKeyUpdate, handlePackageUpdate, keyOptions]);

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
                                            <TableHead key={header.id}>
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
                                                <div className="font-medium text-ios-green">{formatCOP(c.netCOP)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(c.date), 'dd MMM yyyy', { locale: es })} - {formatUSD(c.netUSD)}
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
                                            .reduce((sum, c) => sum + c.netCOP, 0);
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
                <div className="flex flex-col items-center gap-4">
                  <Card className="w-full max-w-md glassmorphism-card">
                    <CardHeader>
                      <CardTitle className="text-center text-lg font-semibold">
                        Ingresos Este Mes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-4xl font-bold tracking-tighter">
                        <span className="text-yellow-400">{formatCOP(financialSummary.incomeThisMonth)}</span>
                        <span className="text-muted-foreground mx-2">/</span>
                        <span className="text-green-400">{formatUSD(financialSummary.incomeThisMonth / (exchangeRate || 4000))}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingresos Acumulados: {formatCOP(financialSummary.totalNetCOP)} / {formatUSD(financialSummary.totalNetUSD)}
                    </p>
                  </div>
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

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="glassmorphism-card max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mensaje para el Cliente</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                           <pre className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto text-sm text-foreground/80 p-2 border rounded-md bg-black/20 font-sans">
                                {messageToShow}
                            </pre>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                         <Button variant="outline" onClick={() => setIsAlertOpen(false)}>Cerrar</Button>
                         <Button onClick={handleCopy}>
                            <Clipboard className="mr-2 h-4 w-4"/>
                            Copiar al Portapapeles
                         </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default WorkTab;
