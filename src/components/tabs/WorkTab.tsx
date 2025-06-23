
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
import { MessageSquare, PlusCircle, Clipboard, TrendingUp, Trash2 } from 'lucide-react';
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

const generateClientMessage = (item: WorkItem): string => {
  let message = `Heyyy ${item.clientName}! 👋👋\n\n`;

  // Parte 1: Saludo inicial
  if (item.packageType === "Masterpiece") {
    message += item.remakeType === "Multiple Remakes"
      ? `Yoooo, your ${item.genre} masterpiece remaked beats are officially done and they're straight fire fr!! 🔥🔥✨ Hahaha, we went CRAZY on these!!\n\n`
      : `Yooo, your ${item.genre} masterpiece is officially done and it's straighttt fire fr!! 🔥✨\n\n`;
  } else if (item.packageType === "Exclusive") {
    message += item.remakeType === "Multiple Remakes"
      ? `Your ${item.genre} remaked beats are readyyy to drop!! 💣💣 No cap, these ones hit DIFFERENT!! 💯🎵\n\n`
      : `Your ${item.genre} beat is readyyy to drop!! No cap, this one hits different 💯🎵\n\n`;
  } else { // Amateurs
    message += item.remakeType === "Multiple Remakes"
      ? `So hereee are those ${item.genre} demos you wanted!! 🎉 Just some quick vibes, nothing too wild yet hehe 😎🎧\n\n`
      : `So here's that ${item.genre} demo you wanted!! Just a quick vibe check, nothing too wild yet 😎🎧\n\n`;
  }

  // Parte 2: Detalles del Remake
  if (item.remakeType === "Single Remake") {
    if (item.packageType === "Masterpiece") {
      message += "🎛️🎛️ This remake got the FULL treatment - custom-built and clean as hell!! Readyyy for the big leagues!! 🏆🏆\n\n";
    } else if (item.packageType === "Exclusive") {
      message += "🎛️ The remake is LOCKED and loaded!! 🔫 Custom-made just for you, readyyy for your vocals!! 🎤✨\n\n";
    } else { // Amateurs
      message += "🎛️ This is just the demo version of the remake - think of it as the rough draft with MADDD potential!! 🎨\n\n";
    }
  } else if (item.remakeType === "Multiple Remakes") {
    if (item.packageType === "Masterpiece") {
      message += "🎛️🎛️ These remakes are CLEANNN as hell and ready to make some NOISEEE!! Each one hits different!! 🚀🚀\n\n";
    } else if (item.packageType === "Exclusive") {
      message += "🎛️ All these remakes are LOCKED IN!! 🔒 Multiple vibes, same CRAZY energy!! 💪💪 Hahaha let's gooo!\n\n";
    } else { // Amateurs
      message += "🎛️ These are just demo ideas for the remakes - the foundation's there, just needs the FULLLL glow-up!! 🏗️🏗️\n\n";
    }
  }

  // Parte 3: Entregables
  message += "📎📎 WHAT YOU'RE GETTING:\n";
  if (item.packageType === "Masterpiece") {
    message += `- Full WAV + STEMS: The WHOLE package, no bs!! 💎\n- FLP Project File: Full creative control in your hands!! 🎚️🎚️\n- Exclusive Rights Contract: It's 100000% yours, period!! 📜\n- EXCLUSIVE GIFT: Custom vocal chain preset made for ${item.remakeType === "Multiple Remakes" ? `these ${item.genre} vibes` : `this ${item.genre} vibe`} 🎙️🎙️\n(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝🤝\n\n`;
  } else if (item.packageType === "Exclusive") {
    message += `- Full WAV: Mixed, mastered, and READYYY to upload!! 🎯\n- Exclusive Rights Contract: 100% ownership, no sharing needed!! 📋\n- EXCLUSIVE GIFT: Custom vocal chain preset made for ${item.remakeType === "Multiple Remakes" ? `these ${item.genre} styles` : `this ${item.genre} style`} 🎤✨\n(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝\n\n`;
  } else { // Amateurs
    message += `- 60-sec MP3 demo: Just the vibe, raw and UNFILTEREDDD!! 🎵\n- Heads up: No exclusive rights or pro mixing included (this is just a taste!!) 👀👀\n\n🤔 BUT WAIT - If you're feeling this demo and want the full experience, just pay the difference:\n• Amateur ($10) → Pro ($15): +$5\n• Amateur ($10) → Exclusive ($30): +$20\n• Pro ($15) → Exclusive ($30): +$15\n\nAnd get:\n• The polished, final version(s) 🔥🔥\n• Exclusive license (100% yours) 📜\n• Professional mixing/mastering 🎛️🎛️\n• Full remake treatment 💯💯\n\nJust holla at me if you wanna upgrade! 🚀🚀\n\n`;
  }

  // Parte 4: Key y BPM
  message += item.remakeType === "Multiple Remakes" 
    ? `Keys: ${item.key} | BPMs: ${item.bpm}\n\n` 
    : `Key: ${item.key} | BPM: ${item.bpm}\n\n`;

  // Parte 5: Número de orden y despedida
  message += `📦📦 Order #${item.orderNumber}\n\n`;
  if (item.packageType === "Masterpiece") {
    message += `✅✅ This is built for the BIGGG stages - Spotify, radio, wherever you wanna take it!! 🌟🌟\n${item.revisionsRemaining} revisions remaining 🔧🔧\n\n🎁 PRO TIP: Drop a 5-star review and I'll hook you UPPP with $10 off your next order!! Helps me out FOR REALLL 🙏🙏\n\nNow go make some MAGIC happen!! ✨🎤`;
  } else if (item.packageType === "Exclusive") {
    message += `✅ ${item.revisionsRemaining} revisions remaining 🔧\n${item.remakeType === "Multiple Remakes" ? "Time to make these BEATS slap!! 💥💥" : "Time to make some WAVES!! 🌊🌊"}\n\n🎁 PRO TIP: Leave me a 5-star review and I'll give you $10 off your next order!! WIN-WIN SITUATION 😉💰💰\n\nLet's get this music out there!!! 🚀🚀`;
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

const packageColorMap: Record<WorkItem['packageType'], string> = {
  'Masterpiece': 'bg-purple-600 hover:bg-purple-700 text-white',
  'Exclusive': 'bg-sky-600 hover:bg-sky-700 text-white',
  'Amateurs': 'bg-teal-600 hover:bg-teal-700 text-white'
};

const remakeColorMap: Record<WorkItem['remakeType'], string> = {
  'Single Remake': 'bg-blue-800 hover:bg-blue-900 text-white',
  'Multiple Remakes': 'bg-purple-800 hover:bg-purple-900 text-white',
  'Original': 'bg-green-800 hover:bg-green-900 text-white',
  'Original Multiple Beats': 'bg-orange-800 hover:bg-orange-900 text-white'
};

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


const WorkTab = () => {
    const { appState, setAppState } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        { accessorKey: 'deliveryDate', header: 'Entrega' },
        { accessorKey: 'genre', header: 'Género' },
        { 
            accessorKey: 'packageType', 
            header: 'Paquete',
            cell: ({ row }) => {
                const packageType = row.getValue('packageType') as WorkItem['packageType'];
                return <Badge className={packageColorMap[packageType]}>{packageType}</Badge>
            }
        },
        { 
            accessorKey: 'remakeType', 
            header: 'Tipo Remake',
            cell: ({ row }) => {
                const remakeType = row.getValue('remakeType') as WorkItem['remakeType'];
                return <Badge className={remakeColorMap[remakeType]}>{remakeType}</Badge>
            }
        },
        { accessorKey: 'key', header: 'Key' },
        { accessorKey: 'bpm', header: 'BPM' },
        { 
            accessorKey: 'deliveryStatus', 
            header: 'Estado',
            cell: ({ row }) => {
                const status = row.getValue('deliveryStatus') as WorkItem['deliveryStatus'];
                return <Badge className={statusColorMap[status]}>{status}</Badge>
            }
        },
        { accessorKey: 'revisionsRemaining', header: 'Revisiones' },
        {
            id: 'edit',
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => {
                    setSelectedItem(row.original);
                    setIsModalOpen(true);
                }}>
                    Editar
                </Button>
            )
        },
    ], []);

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
                        <Button onClick={() => {
                            setSelectedItem(null);
                            setIsModalOpen(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Orden 💵
                        </Button>
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
