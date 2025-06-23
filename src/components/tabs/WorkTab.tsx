
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { MessageSquare, PlusCircle, Clipboard, TrendingUp, Trash2, Settings } from 'lucide-react';
import WorkItemModal from '@/components/WorkItemModal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSound } from '@/context/SoundContext';
import PackageSettingsModal from '@/components/PackageSettingsModal';

const generateClientMessage = (item: WorkItem): string => {
  let message = `Heyyy ${item.clientName}! 👋👋\n\n`;

  // Bloque Principal: Elige la plantilla base según el nombre del paquete
  if (item.packageName === 'Masterpiece') {
    // --- Plantilla Masterpiece ---
    message += `Yooo, your ${item.genre} masterpiece${item.remakeType === 'Multiple Remakes' ? 's are' : ' is'} officially done and it's straighttt fire fr!! ${item.remakeType === 'Multiple Remakes' ? '🔥🔥✨ Hahaha, we went CRAZY on these!!' : '🔥✨'}\n\n`;
    
    if (item.remakeType === 'Single Remake') {
      message += "🎛️🎛️ This remake got the FULL treatment - custom-built and clean as hell!! Readyyy for the big leagues!! 🏆🏆\n\n";
    } else if (item.remakeType === 'Multiple Remakes') {
      message += "🎛️🎛️ These remakes are CLEANNN as hell and ready to make some NOISEEE!! Each one hits different!! 🚀🚀\n\n";
    }

    message += "📎📎 WHAT YOU'RE GETTING:\n";
    if (item.separateFiles) message += "- Full WAV + STEMS: The WHOLE package, no bs!! 💎\n";
    if (item.projectFileDelivery) message += "- FLP Project File: Full creative control in your hands!! 🎚️🎚️\n";
    if (item.exclusiveLicense) message += "- Exclusive Rights Contract: It's 100000% yours, period!! 📜\n";
    // MODIFICACIÓN: Se añade la producción vocal como un extra condicional
    if (item.vocalProduction) message += "- Vocal Production: Pro-level vocal mixing & tuning to make your voice SHINE!! ✨🎙️\n";
    
    if (item.vocalChainPreset) {
      message += `\n🎁 EXCLUSIVE GIFT: Custom vocal chain preset made for ${item.remakeType === 'Multiple Remakes' ? `these ${item.genre} vibes` : `this ${item.genre} vibe`} 🎙️🎙️\n`;
      message += "(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝🤝\n\n";
    }

  } else if (item.packageName === 'Exclusive') {
    // --- Plantilla Exclusive ---
    message += `Your ${item.genre} ${item.remakeType === 'Multiple Remakes' ? 'beats are' : 'beat is'} readyyy to drop!! ${item.remakeType === 'Multiple Remakes' ? '💣💣 No cap, these ones hit DIFFERENT!! 💯🎵' : 'No cap, this one hits different 💯🎵'}\n\n`;

    if (item.remakeType === 'Single Remake') {
      message += "🎛️ The remake is LOCKED and loaded!! 🔫 Custom-made just for you, readyyy for your vocals!! 🎤✨\n\n";
    } else if (item.remakeType === 'Multiple Remakes') {
      message += "🎛️ All these remakes are LOCKED IN!! 🔒 Multiple vibes, same CRAZY energy!! 💪💪 Hahaha let's gooo!\n\n";
    }

    message += "📎📎 WHAT YOU'RE GETTING:\n";
    if (item.masterAudio) message += "- Full WAV: Mixed, mastered, and READYYY to upload!! 🎯\n";
    if (item.exclusiveLicense) message += "- Exclusive Rights Contract: 100% ownership, no sharing needed!! 📋\n";
    // MODIFICACIÓN: Se añade la producción vocal como un extra condicional
    if (item.vocalProduction) message += "- Vocal Production: Pro-level vocal mixing & tuning to make your voice SHINE!! ✨🎙️\n";
    
    if (item.vocalChainPreset) {
      message += `\n🎁 EXCLUSIVE GIFT: Custom vocal chain preset made for ${item.remakeType === 'Multiple Remakes' ? `these ${item.genre} styles` : `this ${item.genre} style`} 🎤✨\n`;
      message += "(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝\n\n";
    }

  } else { // Asumimos 'Amateurs' o cualquier otro
    // --- Plantilla Amateurs ---
    message += `So here's that ${item.genre} demo you wanted!! Just a quick vibe check, nothing too wild yet 😎🎧\n\n`;
    message += "🎛️ This is just the demo version of the remake - think of it as the rough draft with MADDD potential!! 🎨\n\n";
    
    message += "📎📎 WHAT YOU'RE GETTING:\n";
    if (item.songLength > 0) message += `- ${item.songLength}-sec MP3 demo: Just the vibe, raw and UNFILTEREDDD!! 🎵\n`;
    message += "- Heads up: No exclusive rights or pro mixing included (this is just a taste!!) 👀👀\n\n";
    // MODIFICACIÓN: Se añade la producción vocal como un extra condicional también aquí
    if (item.vocalProduction) message += "- Vocal Production Add-on: Available for this track!! 🎤 Ask me about it!\n\n";

    message += "🤔 BUT WAIT - If you're feeling this demo and want the full experience, just pay the difference:\n[Aquí puedes poner la lógica de precios de upgrade si la necesitas]\n\nJust holla at me if you wanna upgrade! 🚀🚀\n\n";
  }

  // --- Secciones Finales (Sin Cambios) ---
  message += `${item.remakeType === 'Multiple Remakes' ? 'Keys' : 'Key'}: ${item.key} | ${item.remakeType === 'Multiple Remakes' ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
  message += `📦📦 Order #${item.orderNumber}\n\n`;

  if (item.packageName === 'Masterpiece') {
    message += `✅✅ This is built for the BIGGG stages - Spotify, radio, wherever you wanna take it!! 🌟🌟\n${item.revisionsRemaining} revisions remaining 🔧🔧\n\n🎁 PRO TIP: Drop a 5-star review and I'll hook you UPPP with $10 off your next order!! Helps me out FOR REALLL 🙏🙏\n\nNow go make some MAGIC happen!! ✨🎤`;
  } else if (item.packageName === 'Exclusive') {
    message += `✅ ${item.revisionsRemaining} revisions remaining 🔧\n${item.remakeType === 'Multiple Remakes' ? "Time to make these BEATS slap!! 💥💥" : "Time to make some WAVES!! 🌊🌊"}\n\n🎁 PRO TIP: Leave me a 5-star review and I'll give you $10 off your next beat!! WIN-WIN SITUATION 😉💰💰\n\nLet's get this music out there!!! 🚀🚀`;
  } else { // Amateurs
    message += "✅ Let me know what you think of the direction!! If you're vibing with it, we can ALWAYSSS take it to the next level!! 🎯🎯\n\n(No revisions on demos, but that's what upgrades are for!! 😉💡💡)";
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

    // --- Income State ---
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

    // --- Income Handlers ---
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
        { accessorKey: 'clientName', header: 'Cliente' },
        { accessorKey: 'orderNumber', header: 'Orden #' },
        { 
            accessorKey: 'deliveryDate', 
            header: 'Entrega',
            cell: ({row}) => format(new Date(row.original.deliveryDate + 'T00:00:00'), "PPP", { locale: es })
        },
        { accessorKey: 'genre', header: 'Género' },
        { 
            accessorKey: 'packageName', 
            header: 'Paquete',
            cell: ({ row }) => {
                const packageName = row.getValue('packageName') as string;
                return <Badge variant="secondary">{packageName}</Badge>
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
                const status = row.getValue('deliveryStatus') as WorkItem['deliveryStatus'];
                return <Badge className={statusColorMap[status]}>{status}</Badge>
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
    ], [handleDeleteWorkItem]);

    const table = useReactTable({
        data: sortedWorkItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    return (
        <div className="space-y-8">
            <Card className="glassmorphism-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>FIVERR📀</CardTitle>
                            <CardDescription>Organiza tus proyectos, clientes y entregas.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setIsSettingsModalOpen(true)}>
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => {
                                setSelectedItem(null);
                                setIsModalOpen(true);
                            }}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nueva Orden 💵
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                <Card className="glassmorphism-card text-center p-6">
                    <p className="text-sm text-muted-foreground">Ingreso Neto Total</p>
                    <p className="text-4xl font-bold text-ios-green">{formatCOP(financialSummary.totalNetCOP)}</p>
                </Card>
                <Card className="glassmorphism-card text-center p-6">
                    <p className="text-sm text-muted-foreground">Ingreso Neto Total (USD)</p>
                    <p className="text-3xl font-semibold text-ios-blue">{formatUSD(financialSummary.totalNetUSD)}</p>
                </Card>
                <Card className="glassmorphism-card text-center p-6">
                    <p className="text-sm text-muted-foreground">Ingresos Este Mes</p>
                    <p className="text-3xl font-semibold">{formatCOP(financialSummary.incomeThisMonth)}</p>
                </Card>
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
