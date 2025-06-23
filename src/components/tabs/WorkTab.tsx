"use client";

import React, { useState, useMemo } from 'react';
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
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState, WorkItem } from '@/context/AppStateContext';
import { MessageSquare, PlusCircle, Clipboard } from 'lucide-react';
import WorkItemModal from '@/components/WorkItemModal';
import { useToast } from '@/hooks/use-toast';


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

const WorkTab = () => {
    const { appState } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [messageToShow, setMessageToShow] = useState('');
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(messageToShow).then(() => {
            toast({ title: 'Copiado', description: 'El mensaje se ha copiado al portapapeles.' });
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el mensaje.' });
            console.error('Failed to copy: ', err);
        });
        setIsAlertOpen(false);
    };

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
        { accessorKey: 'packageType', header: 'Paquete' },
        { accessorKey: 'remakeType', header: 'Tipo Remake' },
        { accessorKey: 'key', header: 'Key' },
        { accessorKey: 'bpm', header: 'BPM' },
        { accessorKey: 'deliveryStatus', header: 'Estado' },
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
        data: appState.workItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    return (
        <>
            <Card className="glassmorphism-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>🎶 Gestión de Producción Musical</CardTitle>
                            <CardDescription>Organiza tus proyectos, clientes y entregas.</CardDescription>
                        </div>
                        <Button onClick={() => {
                            setSelectedItem(null);
                            setIsModalOpen(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Ítem
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

            <WorkItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="glassmorphism-card max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mensaje para el Cliente</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto text-sm text-foreground/80 p-2 border rounded-md bg-black/20">
                            {messageToShow}
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
        </>
    );
};

export default WorkTab;
